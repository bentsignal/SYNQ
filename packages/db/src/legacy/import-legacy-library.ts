/**
 * Imports a 2.5.2 library (an upgraded install or a 2.5.2 backup zip) into
 * library.db. See `docs/migration.md` for the full mapping and the app-side
 * contract. Guarantees:
 *
 * - Reads only: the legacy database through `LegacyDatabase`, the folders
 *   through `LegacyFileSystem`. Nothing legacy is written, moved, or deleted.
 * - All-or-nothing: every row, plus the `legacy_import` record, is written in
 *   one transaction that verifies its own row counts and foreign keys before
 *   committing. Any failure rolls back and the next launch retries.
 * - Idempotent: once a `legacy_import` row exists, it returns
 *   `already-imported` without touching anything.
 * - Ids are preserved, so `library/{id}/` and the cover folders stay valid,
 *   and `sqlite_sequence` is carried over so no 2.5.2 id is ever reissued.
 */
import { count, desc, eq, sql } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";

import type { LibraryDb } from "../client.ts";
import { LIKED_SONGS_NAME } from "../library/playlists.ts";
import {
  albumArtists,
  albums,
  albumSongs,
  artists,
  legacyImport,
  playlists,
  playlistSongs,
  songArtists,
  songs,
  type LegacyImportCounts,
  type LegacyImportSource,
} from "../schema.ts";
import type { LegacyAsyncStorage } from "./async-storage.ts";
import { readLegacyDatabase, type LegacyLinkRow, type LegacySnapshot } from "./read-legacy-db.ts";
import { orphanFolderWarning, resolveAudio, scanFolders, type FolderScan } from "./scan-files.ts";
import { parseLegacySettings, type LegacySettings } from "./settings.ts";
import type { LegacyDatabase, LegacyFileSystem, LegacyImportWarning } from "./types.ts";

/** 2.5.2's hidden playlist holding every song; the library itself in 3.0. */
const LEGACY_LIBRARY_PLAYLIST_ID = 1;
/** 2.5.2's Liked Songs playlist, identified by id (users can rename it). */
const LEGACY_LIKED_PLAYLIST_ID = 2;

export type LegacyImportStep =
  | "reading-database"
  | "scanning-files"
  | "writing"
  | "verifying"
  | "committed";

export interface ImportLegacyLibraryOptions {
  /** The 2.5.2 database, opened read-only (or a copy of it). */
  legacyDb: LegacyDatabase;
  /** library.db, migrated. */
  targetDb: LibraryDb;
  fs: LegacyFileSystem;
  /**
   * The folder holding `SQLite/`, `library/`, `albums/`, `artists/`,
   * `playlists/`: the app's `Documents/` on upgrade, or the extracted backup.
   */
  root: string;
  source: LegacyImportSource;
  /** From `readLegacyAsyncStorage`; omit for backups (they have none). */
  asyncStorage?: LegacyAsyncStorage | null;
  /**
   * Replace whatever library.db holds (restoring a backup over a 3.0
   * library). Without it, a non-empty library is an error and an existing
   * `legacy_import` row makes the call a no-op.
   */
  replaceExisting?: boolean;
  now?: number;
  /** Progress for a splash screen; throwing from it aborts (and rolls back) the import. */
  onProgress?: (step: LegacyImportStep) => void;
}

export type LegacyImportResult =
  | {
      status: "imported";
      importId: number;
      counts: LegacyImportCounts;
      /** Null when there was no AsyncStorage (backups, or a never-configured install). */
      settings: LegacySettings | null;
      warnings: LegacyImportWarning[];
    }
  | {
      status: "already-imported";
      importId: number;
      importedAt: number;
      settings: LegacySettings | null;
    };

export type LegacyImportErrorCode = "target-not-empty" | "verification-failed";

export class LegacyImportError extends Error {
  readonly code: LegacyImportErrorCode;

  constructor(code: LegacyImportErrorCode, message: string) {
    super(message);
    this.name = "LegacyImportError";
    this.code = code;
  }
}

/** The completed import, if any (its `settings` let the app re-apply preferences idempotently). */
export function getLegacyImport(db: LibraryDb) {
  return db.select().from(legacyImport).orderBy(desc(legacyImport.id)).limit(1).get() ?? null;
}

export async function importLegacyLibrary(options: ImportLegacyLibraryOptions): Promise<LegacyImportResult> {
  const { targetDb: db, replaceExisting = false } = options;
  const now = options.now ?? Date.now();
  const root = options.root.replace(/\/+$/, "");

  if (!replaceExisting) {
    const previous = getLegacyImport(db);
    if (previous) return alreadyImported(previous);
    assertTargetEmpty(db, false);
  }

  const warnings: LegacyImportWarning[] = [];
  options.onProgress?.("reading-database");
  const snapshot = await readLegacyDatabase(options.legacyDb, warnings);
  options.onProgress?.("scanning-files");
  const scan = await scanFolders(options.fs, root);
  const plan = planImport(snapshot, scan, now, warnings);

  const asyncStorage = options.asyncStorage ?? null;
  if (asyncStorage && asyncStorage.problems.length > 0) {
    warnings.push({ code: "async-storage", message: asyncStorage.problems.join("; ") });
  }
  const settings = asyncStorage
    ? parseLegacySettings(asyncStorage.values, {
        songIds: new Set(plan.songs.map((s) => s.id)),
        playlistIds: new Set(plan.playlists.map((p) => p.id)),
        albumIds: new Set(plan.albums.map((a) => a.id)),
        artistIds: new Set(plan.artists.map((a) => a.id)),
      })
    : null;
  const counts: LegacyImportCounts = {
    songs: plan.songs.length,
    artists: plan.artists.length,
    albums: plan.albums.length,
    playlists: plan.playlists.length,
    songArtists: plan.songArtists.length,
    albumSongs: plan.albumSongs.length,
    albumArtists: plan.albumArtists.length,
    playlistSongs: plan.playlistSongs.length,
  };

  const outcome = db.transaction((tx): LegacyImportResult => {
    // Re-checked inside the transaction in case two imports raced.
    if (!replaceExisting) {
      const previous = getLegacyImport(tx);
      if (previous) return alreadyImported(previous);
      assertTargetEmpty(tx, true);
    } else {
      clearLibrary(tx);
    }

    options.onProgress?.("writing");
    insertChunked(tx, artists, plan.artists);
    insertChunked(tx, albums, plan.albums);
    insertChunked(tx, songs, plan.songs);
    insertChunked(tx, playlists, plan.playlists);
    insertChunked(tx, songArtists, plan.songArtists);
    insertChunked(tx, albumSongs, plan.albumSongs);
    insertChunked(tx, albumArtists, plan.albumArtists);
    insertChunked(tx, playlistSongs, plan.playlistSongs);
    carrySequences(tx, snapshot.sequences);

    options.onProgress?.("verifying");
    verify(tx, counts);

    const { id } = tx
      .insert(legacyImport)
      .values({
        source: options.source,
        importedAt: now,
        legacyDbVersion: settings?.bookkeeping.legacyDbVersion ?? null,
        counts,
        settings,
        warnings,
      })
      .returning({ id: legacyImport.id })
      .get();
    return { status: "imported", importId: id, counts, settings, warnings };
  });
  options.onProgress?.("committed");
  return outcome;
}

function alreadyImported(row: typeof legacyImport.$inferSelect): LegacyImportResult {
  return {
    status: "already-imported",
    importId: row.id,
    importedAt: row.importedAt,
    settings: (row.settings as LegacySettings | null) ?? null,
  };
}

/**
 * The import assumes it runs before the 3.0 UI ever wrote to library.db. An
 * empty, auto-created Liked Songs is tolerated (it is replaced by 2.5.2's).
 */
function assertTargetEmpty(db: LibraryDb, removePlaceholder: boolean): void {
  const total = (table: SQLiteTable) => db.select({ n: count() }).from(table).get()?.n ?? 0;
  const userPlaylists = db.select({ n: count() }).from(playlists).where(eq(playlists.kind, "user")).get()?.n ?? 0;
  if (total(songs) + total(artists) + total(albums) + total(playlistSongs) + userPlaylists > 0) {
    throw new LegacyImportError(
      "target-not-empty",
      "library.db already has a library; pass replaceExisting to restore over it",
    );
  }
  if (removePlaceholder) db.delete(playlists).run();
}

function clearLibrary(db: LibraryDb): void {
  for (const table of [playlistSongs, albumArtists, albumSongs, songArtists, playlists, songs, albums, artists, legacyImport]) {
    db.delete(table).run();
  }
}

/** Small batches keep each statement well under SQLite's bound-parameter limit. */
function insertChunked<T extends SQLiteTable>(db: LibraryDb, table: T, rows: readonly T["$inferInsert"][]): void {
  for (let start = 0; start < rows.length; start += 100) {
    db.insert(table).values(rows.slice(start, start + 100) as T["$inferInsert"][]).run();
  }
}

const SEQUENCE_TABLES: Record<string, string> = {
  songs: "songs",
  albums: "albums",
  artists: "artists",
  playlists: "playlists",
  playlistSongs: "playlist_songs",
};

/**
 * Raises each AUTOINCREMENT counter to at least 2.5.2's, so a song deleted
 * in 2.5.2 (whose folder may linger) never has its id reused.
 */
function carrySequences(db: LibraryDb, legacy: Record<string, number>): void {
  for (const [legacyName, table] of Object.entries(SEQUENCE_TABLES)) {
    const seq = legacy[legacyName];
    if (seq === undefined) continue;
    const updated = db.run(sql`UPDATE sqlite_sequence SET seq = max(seq, ${seq}) WHERE name = ${table}`);
    if (Number((updated as { changes?: number }).changes ?? 0) === 0) {
      db.run(sql`INSERT INTO sqlite_sequence (name, seq) VALUES (${table}, ${seq})`);
    }
  }
}

function verify(db: LibraryDb, expected: LegacyImportCounts): void {
  const tables: [keyof LegacyImportCounts, SQLiteTable][] = [
    ["songs", songs],
    ["artists", artists],
    ["albums", albums],
    ["playlists", playlists],
    ["songArtists", songArtists],
    ["albumSongs", albumSongs],
    ["albumArtists", albumArtists],
    ["playlistSongs", playlistSongs],
  ];
  for (const [key, table] of tables) {
    const actual = db.select({ n: count() }).from(table).get()?.n ?? 0;
    if (actual !== expected[key]) {
      throw new LegacyImportError("verification-failed", `${key}: wrote ${actual} rows, expected ${expected[key]}`);
    }
  }
  const violations = db.all(sql`PRAGMA foreign_key_check`);
  if (violations.length > 0) {
    throw new LegacyImportError("verification-failed", `${violations.length} foreign key violations`);
  }
}

/** Rows keep their 2.5.2 ids. */
type WithId<T> = T & { id: number };

interface ImportPlan {
  songs: WithId<typeof songs.$inferInsert>[];
  artists: WithId<typeof artists.$inferInsert>[];
  albums: WithId<typeof albums.$inferInsert>[];
  playlists: WithId<typeof playlists.$inferInsert>[];
  songArtists: (typeof songArtists.$inferInsert)[];
  albumSongs: (typeof albumSongs.$inferInsert)[];
  albumArtists: (typeof albumArtists.$inferInsert)[];
  playlistSongs: (typeof playlistSongs.$inferInsert)[];
}

/**
 * Synthesized timestamps: 2.5.2 kept no dates, only id order, so the n rows
 * of a table get `now - n .. now - 1` ms in id order. "Date added" sorting
 * then matches 2.5.2's, and anything added in 3.0 sorts after.
 */
function synthesizedTimes(n: number, now: number): (index: number) => number {
  return (index) => now - n + index;
}

export function planImport(snapshot: LegacySnapshot, scan: FolderScan, now: number, warnings: LegacyImportWarning[]): ImportPlan {
  const byId = <T extends { id: number }>(rows: T[]) => [...rows].sort((a, b) => a.id - b.id);

  // Songs. 2.5.2's Songs tab showed its hidden Library playlist, not the
  // songs table: a row outside it is a half-finished import the user never saw.
  const libraryMembers = new Set(
    snapshot.playlistSongs.filter((link) => link.left === LEGACY_LIBRARY_PLAYLIST_ID).map((link) => link.right),
  );
  const everyoneVisible = libraryMembers.size === 0;
  if (everyoneVisible && snapshot.songs.length > 0) {
    warnings.push({
      code: "library-playlist-empty",
      message: "The hidden Library playlist was empty; every song row was imported",
    });
  }
  const recovered: number[] = [];
  const missing: number[] = [];
  const hiddenSkipped: number[] = [];
  const hiddenImported: number[] = [];
  const songRows = byId(snapshot.songs).flatMap((song) => {
    const audio = resolveAudio(song.id, song.fileName, scan.song.get(song.id));
    const visible = everyoneVisible || libraryMembers.has(song.id);
    if (!visible && !audio.found) {
      hiddenSkipped.push(song.id);
      return [];
    }
    if (!visible) hiddenImported.push(song.id);
    if (audio.recovered) recovered.push(song.id);
    if (!audio.found) missing.push(song.id);
    return [{ song, audio }];
  });
  const songTime = synthesizedTimes(songRows.length, now);
  const plannedSongs = songRows.map(({ song, audio }, index) => ({
    id: song.id,
    title: song.title ?? "",
    filePath: audio.filePath,
    mimeType: song.fileType?.trim() || null,
    durationMs: song.durationSeconds !== null && song.durationSeconds > 0 ? Math.round(song.durationSeconds * 1000) : 0,
    artworkVersion: scan.song.get(song.id)?.artworkVersion ?? null,
    addedAt: songTime(index),
    modifiedSinceExport: song.edited,
  }));
  pushIds(warnings, "audio-file-recovered", "Used the only audio file in the folder (fileName empty or wrong)", recovered);
  pushIds(warnings, "audio-file-missing", "No audio file found; kept with the recorded path", missing);
  pushIds(warnings, "hidden-song-skipped", "Skipped song rows 2.5.2 never showed that have no audio", hiddenSkipped);
  pushIds(warnings, "hidden-song-imported", "Imported song rows 2.5.2 never showed whose audio exists", hiddenImported);

  const artistRows = byId(snapshot.artists);
  const artistTime = synthesizedTimes(artistRows.length, now);
  const plannedArtists = artistRows.map((artist, index) => ({
    id: artist.id,
    name: artist.name ?? "",
    artworkVersion: scan.artist.get(artist.id)?.artworkVersion ?? null,
    addedAt: artistTime(index),
  }));

  const albumRows = byId(snapshot.albums);
  const albumTime = synthesizedTimes(albumRows.length, now);
  const plannedAlbums = albumRows.map((album, index) => ({
    id: album.id,
    name: album.name ?? "",
    year: album.year,
    artworkVersion: scan.album.get(album.id)?.artworkVersion ?? null,
    addedAt: albumTime(index),
  }));

  // Playlists: drop the hidden Library playlist; playlist 2 is Liked Songs
  // under whatever name the user gave it.
  const playlistRows = byId(snapshot.playlists).filter((p) => p.id !== LEGACY_LIBRARY_PLAYLIST_ID);
  if (!playlistRows.some((p) => p.id === LEGACY_LIKED_PLAYLIST_ID)) {
    // 2.5.2 still recorded likes as playlistSongs rows for id 2, so they're kept.
    playlistRows.push({ id: LEGACY_LIKED_PLAYLIST_ID, name: null });
    playlistRows.sort((a, b) => a.id - b.id);
    warnings.push({ code: "liked-playlist-recreated", message: "Playlist 2 (Liked Songs) had no row; recreated it" });
  }
  const playlistTime = synthesizedTimes(playlistRows.length, now);
  const plannedPlaylists = playlistRows.map((playlist, index) => {
    const liked = playlist.id === LEGACY_LIKED_PLAYLIST_ID;
    const name = playlist.name ?? "";
    return {
      id: playlist.id,
      name: liked && name.trim() === "" ? LIKED_SONGS_NAME : name,
      kind: liked ? ("liked" as const) : ("user" as const),
      artworkVersion: scan.playlist.get(playlist.id)?.artworkVersion ?? null,
      createdAt: playlistTime(index),
      updatedAt: playlistTime(index),
    };
  });

  const songIds = new Set(plannedSongs.map((s) => s.id));
  const artistIds = new Set(plannedArtists.map((a) => a.id));
  const albumIds = new Set(plannedAlbums.map((a) => a.id));
  const playlistIds = new Set(plannedPlaylists.map((p) => p.id));
  const tally = { orphans: new Map<string, number>(), duplicates: new Map<string, number>() };

  const plannedSongArtists = linkRows(
    "artistSongs",
    snapshot.artistSongs,
    (l) => artistIds.has(l.left) && songIds.has(l.right),
    (l) => l.right,
    tally,
  ).map(({ link, position }) => ({ songId: link.right, artistId: link.left, position }));

  const plannedAlbumSongs = linkRows(
    "albumSongs",
    snapshot.albumSongs,
    (l) => albumIds.has(l.left) && songIds.has(l.right),
    (l) => l.right,
    tally,
  ).map(({ link, position, duplicates }) => ({
    albumId: link.left,
    songId: link.right,
    // 2.5.2 updated every duplicate's track together; take the first one set.
    track: link.track ?? duplicates.find((d) => d.track !== null)?.track ?? null,
    position,
  }));

  const plannedAlbumArtists = linkRows(
    "artistsAlbums",
    snapshot.artistsAlbums,
    (l) => artistIds.has(l.left) && albumIds.has(l.right),
    (l) => l.right,
    tally,
  ).map(({ link, position }) => ({ albumId: link.right, artistId: link.left, position }));

  const plannedPlaylistSongs = linkRows(
    "playlistSongs",
    snapshot.playlistSongs.filter((l) => l.left !== LEGACY_LIBRARY_PLAYLIST_ID),
    (l) => playlistIds.has(l.left) && songIds.has(l.right),
    (l) => l.left,
    tally,
  ).map(({ link, position }) => ({
    id: link.rowid,
    playlistId: link.left,
    songId: link.right,
    position: position + 1,
  }));

  if (tally.orphans.size > 0) {
    warnings.push({ code: "orphan-join-rows", message: `Dropped orphan rows: ${describe(tally.orphans)}` });
  }
  if (tally.duplicates.size > 0) {
    warnings.push({ code: "duplicate-join-rows", message: `Dropped duplicate rows: ${describe(tally.duplicates)}` });
  }

  const partial = (["song", "album", "artist", "playlist"] as const).flatMap((kind) =>
    [...scan[kind]].filter(([, folder]) => folder.partialArtwork).map(([id]) => `${kind} ${id}`),
  );
  if (partial.length > 0) {
    warnings.push({ code: "partial-artwork", message: `Only one cover size exists for: ${partial.join(", ")}` });
  }
  const orphanFolders = orphanFolderWarning(scan, {
    song: new Set(snapshot.songs.map((s) => s.id)),
    album: albumIds,
    artist: artistIds,
    playlist: new Set(snapshot.playlists.map((p) => p.id)),
  });
  if (orphanFolders) warnings.push(orphanFolders);

  return {
    songs: plannedSongs,
    artists: plannedArtists,
    albums: plannedAlbums,
    playlists: plannedPlaylists,
    songArtists: plannedSongArtists,
    albumSongs: plannedAlbumSongs,
    albumArtists: plannedAlbumArtists,
    playlistSongs: plannedPlaylistSongs,
  };
}

/**
 * Keeps the first (lowest rowid) of each (left, right) pair whose ends both
 * exist, numbering positions 0.. within `groupOf` in rowid order.
 */
function linkRows(
  table: string,
  links: readonly LegacyLinkRow[],
  valid: (link: LegacyLinkRow) => boolean,
  groupOf: (link: LegacyLinkRow) => number,
  tally: { orphans: Map<string, number>; duplicates: Map<string, number> },
): { link: LegacyLinkRow; position: number; duplicates: LegacyLinkRow[] }[] {
  const firsts = new Map<string, { link: LegacyLinkRow; duplicates: LegacyLinkRow[] }>();
  for (const link of [...links].sort((a, b) => a.rowid - b.rowid)) {
    if (!valid(link)) {
      tally.orphans.set(table, (tally.orphans.get(table) ?? 0) + 1);
      continue;
    }
    const key = `${link.left}:${link.right}`;
    const first = firsts.get(key);
    if (first) {
      first.duplicates.push(link);
      tally.duplicates.set(table, (tally.duplicates.get(table) ?? 0) + 1);
    } else {
      firsts.set(key, { link, duplicates: [] });
    }
  }
  const nextPosition = new Map<number, number>();
  return [...firsts.values()].map((entry) => {
    const group = groupOf(entry.link);
    const position = nextPosition.get(group) ?? 0;
    nextPosition.set(group, position + 1);
    return { ...entry, position };
  });
}

function pushIds(warnings: LegacyImportWarning[], code: LegacyImportWarning["code"], message: string, ids: number[]): void {
  if (ids.length > 0) warnings.push({ code, message: `${message} (${ids.length})`, ids });
}

function describe(counts: Map<string, number>): string {
  return [...counts].map(([table, n]) => `${table} ${n}`).join(", ");
}
