import { and, asc, eq, inArray, max, ne, sql } from "drizzle-orm";

import type { LibraryDb } from "../client.ts";
import { playlists, playlistSongs, songs, type PlaylistKind } from "../schema.ts";
import { artworkDir, artworkRef, type ArtworkRef } from "./artwork.ts";
import { nowFrom, written, type WriteOptions, type WriteResult } from "./changes.ts";
import { LibraryError } from "./errors.ts";
import { assertUniqueName, requireName, uniqueIds } from "./find-or-create.ts";
import { loadSongItems, songSearchFields, type SongListItem } from "./song-items.ts";
import { sortSongs, type SongSort } from "./songs.ts";
import { matchesSearch, sortBy, type SortOrder } from "./text.ts";

/** The default name of Liked Songs; users may rename it. */
export const LIKED_SONGS_NAME = "Liked Songs";

export interface PlaylistListItem {
  id: number;
  name: string;
  kind: PlaylistKind;
  artwork: ArtworkRef | null;
  createdAt: number;
  updatedAt: number;
  songCount: number;
  durationMs: number;
}

export type PlaylistSort = "name" | "createdAt";

export interface ListPlaylistsOptions {
  sort?: PlaylistSort;
  order?: SortOrder;
  search?: string;
}

/** Playlists with counts and total duration; Liked Songs always first (as in 2.5.2). */
export function listPlaylists(db: LibraryDb, options: ListPlaylistsOptions = {}): PlaylistListItem[] {
  const items = selectPlaylists(db).filter((p) => matchesSearch(options.search, [p.name]));
  const order = options.order ?? "desc";
  const sorted =
    (options.sort ?? "createdAt") === "name"
      ? sortBy(items, order, [(p) => p.name, (p) => p.id])
      : sortBy(items, order, [(p) => p.createdAt, (p) => p.id]);
  return [...sorted.filter((p) => p.kind === "liked"), ...sorted.filter((p) => p.kind !== "liked")];
}

export function getPlaylist(db: LibraryDb, id: number): PlaylistListItem | null {
  return selectPlaylists(db, eq(playlists.id, id))[0] ?? null;
}

function selectPlaylists(db: LibraryDb, where?: ReturnType<typeof eq>): PlaylistListItem[] {
  return db
    .select({
      id: playlists.id,
      name: playlists.name,
      kind: playlists.kind,
      artworkVersion: playlists.artworkVersion,
      createdAt: playlists.createdAt,
      updatedAt: playlists.updatedAt,
      songCount: sql<number>`count(${playlistSongs.id})`,
      durationMs: sql<number>`coalesce(sum(${songs.durationMs}), 0)`,
    })
    .from(playlists)
    .leftJoin(playlistSongs, eq(playlistSongs.playlistId, playlists.id))
    .leftJoin(songs, eq(songs.id, playlistSongs.songId))
    .where(where)
    .groupBy(playlists.id)
    .all()
    .map(({ artworkVersion, ...row }) => ({ ...row, artwork: artworkRef("playlist", row.id, artworkVersion) }));
}

export interface PlaylistSongItem extends SongListItem {
  /** The `playlist_songs` row id. */
  entryId: number;
  position: number;
}

export interface ListPlaylistSongsOptions {
  /** `position` is the playlist's own order (2.5.2's "date added"). */
  sort?: "position" | SongSort;
  order?: SortOrder;
  search?: string;
}

export function listPlaylistSongs(
  db: LibraryDb,
  playlistId: number,
  options: ListPlaylistSongsOptions = {},
): PlaylistSongItem[] {
  const entries = db
    .select({ entryId: playlistSongs.id, songId: playlistSongs.songId, position: playlistSongs.position })
    .from(playlistSongs)
    .where(eq(playlistSongs.playlistId, playlistId))
    .orderBy(asc(playlistSongs.position))
    .all();
  const songsById = new Map(
    loadSongItems(
      db,
      inArray(songs.id, db.select({ id: playlistSongs.songId }).from(playlistSongs).where(eq(playlistSongs.playlistId, playlistId))),
    ).map((song) => [song.id, song]),
  );
  const items = entries.flatMap(({ entryId, songId, position }) => {
    const song = songsById.get(songId);
    return song ? [{ ...song, entryId, position }] : [];
  });
  const filtered = items.filter((song) => matchesSearch(options.search, songSearchFields(song)));
  const sort = options.sort ?? "position";
  const order = options.order ?? "asc";
  if (sort === "position") return order === "asc" ? filtered : filtered.reverse();
  return sortSongs(filtered, sort, order);
}

/** The Liked Songs playlist id, creating the playlist if it doesn't exist. Call at startup, after the legacy import. */
export function ensureLikedPlaylist(db: LibraryDb, options?: WriteOptions): WriteResult<number> {
  const existing = findLikedPlaylistId(db);
  if (existing !== null) return written(existing, []);
  const now = nowFrom(options);
  const { id } = db
    .insert(playlists)
    .values({ name: LIKED_SONGS_NAME, kind: "liked", createdAt: now, updatedAt: now })
    .returning({ id: playlists.id })
    .get();
  return written(id, ["playlists"]);
}

export function findLikedPlaylistId(db: LibraryDb): number | null {
  return db.select({ id: playlists.id }).from(playlists).where(eq(playlists.kind, "liked")).get()?.id ?? null;
}

export function isSongLiked(db: LibraryDb, songId: number): boolean {
  return !!db
    .select({ id: playlistSongs.id })
    .from(playlistSongs)
    .innerJoin(playlists, eq(playlists.id, playlistSongs.playlistId))
    .where(and(eq(playlists.kind, "liked"), eq(playlistSongs.songId, songId)))
    .get();
}

/** Likes or unlikes a song (adds it to the end of Liked Songs, or removes it). */
export function setSongLiked(db: LibraryDb, songId: number, liked: boolean, options?: WriteOptions): WriteResult<void> {
  return db.transaction((tx) => {
    const likedId = ensureLikedPlaylist(tx, options).value;
    const result = liked
      ? addSongsToPlaylist(tx, likedId, [songId], options)
      : removeSongsFromPlaylist(tx, likedId, [songId], options);
    return written(undefined, result.changed);
  });
}

export function createPlaylist(db: LibraryDb, name: string, options?: WriteOptions): WriteResult<PlaylistListItem> {
  const now = nowFrom(options);
  const cleaned = requireName(name, "Playlist");
  const id = db.transaction((tx) => {
    assertUniquePlaylistName(tx, cleaned, undefined, null);
    return tx
      .insert(playlists)
      .values({ name: cleaned, kind: "user", createdAt: now, updatedAt: now })
      .returning({ id: playlists.id })
      .get().id;
  });
  return written(requirePlaylist(db, id), ["playlists"]);
}

/** Renames any playlist, Liked Songs included (2.5.2 allowed that too). */
export function renamePlaylist(db: LibraryDb, id: number, name: string, options?: WriteOptions): WriteResult<PlaylistListItem> {
  const cleaned = requireName(name, "Playlist");
  db.transaction((tx) => {
    const current = tx.select({ name: playlists.name }).from(playlists).where(eq(playlists.id, id)).get();
    if (!current) throw new LibraryError("not-found", `No playlist ${id}`);
    assertUniquePlaylistName(tx, cleaned, id, current.name);
    const updated = tx
      .update(playlists)
      .set({ name: cleaned, updatedAt: nowFrom(options) })
      .where(eq(playlists.id, id))
      .run().changes;
    if (updated === 0) throw new LibraryError("not-found", `No playlist ${id}`);
  });
  return written(requirePlaylist(db, id), ["playlists"]);
}

/** Deletes a user playlist and its entries. Liked Songs can't be deleted. */
export function deletePlaylist(db: LibraryDb, id: number): WriteResult<{ deletePaths: string[] }> {
  db.transaction((tx) => {
    const row = tx.select({ kind: playlists.kind }).from(playlists).where(eq(playlists.id, id)).get();
    if (!row) throw new LibraryError("not-found", `No playlist ${id}`);
    if (row.kind === "liked") throw new LibraryError("liked-playlist", "Liked Songs can't be deleted");
    tx.delete(playlists).where(eq(playlists.id, id)).run();
  });
  return written({ deletePaths: [artworkDir("playlist", id)] }, ["playlists", "playlist_songs"]);
}

/**
 * Appends songs to a playlist in the given order. A playlist holds a song at
 * most once; songs already in it are reported in `skipped`, not moved.
 */
export function addSongsToPlaylist(
  db: LibraryDb,
  playlistId: number,
  songIds: readonly number[],
  options?: WriteOptions,
): WriteResult<{ added: number[]; skipped: number[] }> {
  const result = db.transaction((tx) => {
    requirePlaylistRow(tx, playlistId);
    const present = new Set(
      tx.select({ id: playlistSongs.songId }).from(playlistSongs).where(eq(playlistSongs.playlistId, playlistId)).all().map((r) => r.id),
    );
    const existingSongs = new Set(
      tx.select({ id: songs.id }).from(songs).where(inArray(songs.id, uniqueIds(songIds))).all().map((r) => r.id),
    );
    const added: number[] = [];
    const skipped: number[] = [];
    for (const id of uniqueIds(songIds)) {
      if (present.has(id) || !existingSongs.has(id)) skipped.push(id);
      else added.push(id);
    }
    if (added.length > 0) {
      const last = tx.select({ value: max(playlistSongs.position) }).from(playlistSongs).where(eq(playlistSongs.playlistId, playlistId)).get();
      const start = Math.floor(last?.value ?? 0) + 1;
      tx.insert(playlistSongs)
        .values(added.map((songId, index) => ({ playlistId, songId, position: start + index })))
        .run();
      touchPlaylist(tx, playlistId, options);
    }
    return { added, skipped };
  });
  return written(result, result.added.length > 0 ? ["playlist_songs", "playlists"] : []);
}

export function removeSongsFromPlaylist(
  db: LibraryDb,
  playlistId: number,
  songIds: readonly number[],
  options?: WriteOptions,
): WriteResult<{ removed: number }> {
  const removed = db.transaction((tx) => {
    const count = tx
      .delete(playlistSongs)
      .where(and(eq(playlistSongs.playlistId, playlistId), inArray(playlistSongs.songId, uniqueIds(songIds))))
      .run().changes;
    if (count > 0) touchPlaylist(tx, playlistId, options);
    return count;
  });
  return written({ removed }, removed > 0 ? ["playlist_songs", "playlists"] : []);
}

/** Below this gap between neighbours, a move renumbers the playlist instead of bisecting. */
const MIN_POSITION_GAP = 1e-6;

/**
 * Moves a song to `toIndex` in the playlist's order (0-based, clamped),
 * writing only its row: the new position is the midpoint of its new
 * neighbours. When repeated moves have worn the gap down, the playlist is
 * renumbered 1..n first.
 */
export function moveSongInPlaylist(
  db: LibraryDb,
  playlistId: number,
  songId: number,
  toIndex: number,
  options?: WriteOptions,
): WriteResult<{ position: number }> {
  const position = db.transaction((tx) => {
    let entries = orderedEntries(tx, playlistId);
    if (!entries.some((e) => e.songId === songId)) {
      throw new LibraryError("not-found", `Song ${songId} is not in playlist ${playlistId}`);
    }
    let target = bisect(entries, songId, toIndex);
    if (target === null) {
      renumber(tx, entries);
      entries = orderedEntries(tx, playlistId);
      target = bisect(entries, songId, toIndex) ?? 0;
    }
    const current = entries.find((e) => e.songId === songId);
    if (current && current.position !== target) {
      tx.update(playlistSongs).set({ position: target }).where(eq(playlistSongs.id, current.id)).run();
      touchPlaylist(tx, playlistId, options);
    }
    return target;
  });
  return written({ position }, ["playlist_songs", "playlists"]);
}

interface Entry {
  id: number;
  songId: number;
  position: number;
}

function orderedEntries(db: LibraryDb, playlistId: number): Entry[] {
  return db
    .select({ id: playlistSongs.id, songId: playlistSongs.songId, position: playlistSongs.position })
    .from(playlistSongs)
    .where(eq(playlistSongs.playlistId, playlistId))
    .orderBy(asc(playlistSongs.position))
    .all();
}

/** The position that puts `songId` at `toIndex`, or null if the neighbours are too close. */
function bisect(entries: readonly Entry[], songId: number, toIndex: number): number | null {
  const others = entries.filter((e) => e.songId !== songId);
  const index = Math.max(0, Math.min(others.length, Math.trunc(toIndex)));
  const current = entries.findIndex((e) => e.songId === songId);
  if (current === index) return entries[current]?.position ?? null;
  const before = others[index - 1]?.position;
  const after = others[index]?.position;
  if (before === undefined && after === undefined) return entries.find((e) => e.songId === songId)?.position ?? 1;
  if (before === undefined) return (after as number) - 1;
  if (after === undefined) return before + 1;
  if (after - before < MIN_POSITION_GAP) return null;
  const mid = (before + after) / 2;
  return mid > before && mid < after ? mid : null;
}

/**
 * Renumbers 1..n in two passes so the unique (playlist, position) index never
 * sees a collision: first below every current position, then to 1..n.
 */
function renumber(db: LibraryDb, entries: readonly Entry[]): void {
  const base = Math.min(0, entries[0]?.position ?? 0) - entries.length - 1;
  entries.forEach((entry, index) => {
    db.update(playlistSongs).set({ position: base - index }).where(eq(playlistSongs.id, entry.id)).run();
  });
  entries.forEach((entry, index) => {
    db.update(playlistSongs).set({ position: index + 1 }).where(eq(playlistSongs.id, entry.id)).run();
  });
}

function touchPlaylist(db: LibraryDb, id: number, options?: WriteOptions): void {
  db.update(playlists).set({ updatedAt: nowFrom(options) }).where(eq(playlists.id, id)).run();
}

function requirePlaylistRow(db: LibraryDb, id: number): void {
  if (!db.select({ id: playlists.id }).from(playlists).where(eq(playlists.id, id)).get()) {
    throw new LibraryError("not-found", `No playlist ${id}`);
  }
}

function requirePlaylist(db: LibraryDb, id: number): PlaylistListItem {
  const playlist = getPlaylist(db, id);
  if (!playlist) throw new LibraryError("not-found", `No playlist ${id}`);
  return playlist;
}

/** 2.5.2 refused duplicate playlist names; 3.0 does too, ignoring case. */
function assertUniquePlaylistName(db: LibraryDb, name: string, exceptId: number | undefined, currentName: string | null): void {
  const others = db
    .select({ name: playlists.name })
    .from(playlists)
    .where(exceptId === undefined ? undefined : ne(playlists.id, exceptId))
    .all();
  assertUniqueName(others, name, currentName, "A playlist");
}
