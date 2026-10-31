/**
 * Turns the read-only 2.5.2 snapshot and folder scan into the rows 3.0 will
 * hold: ids preserved, join rows deduplicated, positions renumbered. Pure:
 * nothing here touches a database or a file, and every anomaly that changes
 * what the user gets is recorded as a warning.
 */
import type { PlanContext } from "./plan-context.ts";
import type { LegacySnapshot } from "./read-legacy-db.ts";
import type { FolderScan } from "./scan-files.ts";
import type { LegacyImportWarning } from "./types.ts";
import { LIKED_SONGS_NAME } from "../library/playlists.ts";
import {
  LEGACY_LIBRARY_PLAYLIST_ID,
  LEGACY_LIKED_PLAYLIST_ID,
} from "./plan-context.ts";
import { planLinks } from "./plan-links.ts";
import { orphanFolderWarning, resolveAudio } from "./scan-files.ts";

export type ImportPlan = ReturnType<typeof planImport>;

export function planImport(
  snapshot: LegacySnapshot,
  scan: FolderScan,
  now: number,
  warnings: LegacyImportWarning[],
) {
  const context = { snapshot, scan, now, warnings };
  const songs = planSongs(context);
  const artists = planArtists(context);
  const albums = planAlbums(context);
  const playlists = planPlaylists(context);
  const links = planLinks(context, {
    songIds: new Set(songs.map((s) => s.id)),
    artistIds: new Set(artists.map((a) => a.id)),
    albumIds: new Set(albums.map((a) => a.id)),
    playlistIds: new Set(playlists.map((p) => p.id)),
  });
  warnAboutArtwork(context, {
    album: new Set(albums.map((a) => a.id)),
    artist: new Set(artists.map((a) => a.id)),
  });
  return { songs, artists, albums, playlists, ...links };
}

function byId<T extends { id: number }>(rows: T[]) {
  return [...rows].sort((a, b) => a.id - b.id);
}

/**
 * Synthesized timestamps: 2.5.2 kept no dates, only id order, so the n rows
 * of a table get `now - n .. now - 1` ms in id order. "Date added" sorting
 * then matches 2.5.2's, and anything added in 3.0 sorts after.
 */
function synthesizedTimes(n: number, now: number) {
  return (index: number) => now - n + index;
}

// Songs. 2.5.2's Songs tab showed its hidden Library playlist, not the
// songs table: a row outside it is a half-finished import the user never saw.
function planSongs({ snapshot, scan, now, warnings }: PlanContext) {
  const libraryMembers = new Set(
    snapshot.playlistSongs
      .filter((link) => link.left === LEGACY_LIBRARY_PLAYLIST_ID)
      .map((link) => link.right),
  );
  const everyoneVisible = libraryMembers.size === 0;
  if (everyoneVisible && snapshot.songs.length > 0) {
    warnings.push({
      code: "library-playlist-empty",
      message:
        "The hidden Library playlist was empty; every song row was imported",
    });
  }
  const recovered = new Array<number>();
  const missing = new Array<number>();
  const hiddenSkipped = new Array<number>();
  const hiddenImported = new Array<number>();
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
  const planned = songRows.map(({ song, audio }, index) => ({
    id: song.id,
    title: song.title ?? "",
    filePath: audio.filePath,
    mimeType: (song.fileType?.trim() ?? "") || null,
    durationMs:
      song.durationSeconds !== null && song.durationSeconds > 0
        ? Math.round(song.durationSeconds * 1000)
        : 0,
    artworkVersion: scan.song.get(song.id)?.artworkVersion ?? null,
    addedAt: songTime(index),
    modifiedSinceExport: song.edited,
  }));
  pushIds(
    warnings,
    "audio-file-recovered",
    "Used the only audio file in the folder (fileName empty or wrong)",
    recovered,
  );
  pushIds(
    warnings,
    "audio-file-missing",
    "No audio file found; kept with the recorded path",
    missing,
  );
  pushIds(
    warnings,
    "hidden-song-skipped",
    "Skipped song rows 2.5.2 never showed that have no audio",
    hiddenSkipped,
  );
  pushIds(
    warnings,
    "hidden-song-imported",
    "Imported song rows 2.5.2 never showed whose audio exists",
    hiddenImported,
  );
  return planned;
}

function planArtists({ snapshot, scan, now }: PlanContext) {
  const rows = byId(snapshot.artists);
  const time = synthesizedTimes(rows.length, now);
  return rows.map((artist, index) => ({
    id: artist.id,
    name: artist.name ?? "",
    artworkVersion: scan.artist.get(artist.id)?.artworkVersion ?? null,
    addedAt: time(index),
  }));
}

function planAlbums({ snapshot, scan, now }: PlanContext) {
  const rows = byId(snapshot.albums);
  const time = synthesizedTimes(rows.length, now);
  return rows.map((album, index) => ({
    id: album.id,
    name: album.name ?? "",
    year: album.year,
    artworkVersion: scan.album.get(album.id)?.artworkVersion ?? null,
    addedAt: time(index),
  }));
}

// Playlists: drop the hidden Library playlist; playlist 2 is Liked Songs
// under whatever name the user gave it.
function planPlaylists({ snapshot, scan, now, warnings }: PlanContext) {
  const rows = byId(snapshot.playlists).filter(
    (p) => p.id !== LEGACY_LIBRARY_PLAYLIST_ID,
  );
  if (!rows.some((p) => p.id === LEGACY_LIKED_PLAYLIST_ID)) {
    // 2.5.2 still recorded likes as playlistSongs rows for id 2, so they're kept.
    rows.push({ id: LEGACY_LIKED_PLAYLIST_ID, name: null });
    rows.sort((a, b) => a.id - b.id);
    warnings.push({
      code: "liked-playlist-recreated",
      message: "Playlist 2 (Liked Songs) had no row; recreated it",
    });
  }
  const time = synthesizedTimes(rows.length, now);
  return rows.map((playlist, index) => {
    const liked = playlist.id === LEGACY_LIKED_PLAYLIST_ID;
    const name = playlist.name ?? "";
    return {
      id: playlist.id,
      name: liked && name.trim() === "" ? LIKED_SONGS_NAME : name,
      kind: liked ? ("liked" as const) : ("user" as const),
      artworkVersion: scan.playlist.get(playlist.id)?.artworkVersion ?? null,
      createdAt: time(index),
      updatedAt: time(index),
    };
  });
}

function warnAboutArtwork(
  { snapshot, scan, warnings }: PlanContext,
  planned: { album: ReadonlySet<number>; artist: ReadonlySet<number> },
) {
  const partial = (["song", "album", "artist", "playlist"] as const).flatMap(
    (kind) =>
      [...scan[kind]]
        .filter(([, folder]) => folder.partialArtwork)
        .map(([id]) => `${kind} ${id}`),
  );
  if (partial.length > 0) {
    warnings.push({
      code: "partial-artwork",
      message: `Only one cover size exists for: ${partial.join(", ")}`,
    });
  }
  const orphanFolders = orphanFolderWarning(scan, {
    song: new Set(snapshot.songs.map((s) => s.id)),
    album: planned.album,
    artist: planned.artist,
    playlist: new Set(snapshot.playlists.map((p) => p.id)),
  });
  if (orphanFolders) warnings.push(orphanFolders);
}

function pushIds(
  warnings: LegacyImportWarning[],
  code: LegacyImportWarning["code"],
  message: string,
  ids: number[],
) {
  if (ids.length > 0)
    warnings.push({ code, message: `${message} (${ids.length})`, ids });
}
