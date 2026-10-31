import { eq, inArray } from "drizzle-orm";

import type { LibraryDb } from "../client.ts";
import type { WriteOptions } from "./changes.ts";
import type { SongListItem } from "./song-items.ts";
import type { SortOrder } from "./text.ts";
import { playlists, playlistSongs, songs } from "../schema.ts";
import { artworkDir } from "./artwork.ts";
import { nowFrom, written } from "./changes.ts";
import { uniqueIds } from "./find-or-create.ts";
import { loadSongItems, songSearchFields } from "./song-items.ts";
import { matchesSearch, sortBy } from "./text.ts";

export type SongSort = "title" | "artist" | "album" | "addedAt";

export interface ListSongsOptions {
  sort?: SongSort;
  order?: SortOrder;
  search?: string;
}

/** The whole library (2.5.2's Songs tab). Defaults to newest first, like 2.5.2. */
export function listSongs(db: LibraryDb, options: ListSongsOptions = {}) {
  const items = loadSongItems(db).filter((song) =>
    matchesSearch(options.search, songSearchFields(song)),
  );
  return sortSongs(items, options.sort ?? "addedAt", options.order ?? "desc");
}

export function sortSongs<T extends SongListItem>(
  items: T[],
  sort: SongSort,
  order: SortOrder,
) {
  switch (sort) {
    case "title":
      return sortBy(items, order, [(s) => s.title, (s) => s.id]);
    case "artist":
      return sortBy(items, order, [
        (s) => s.artists[0]?.name,
        (s) => s.title,
        (s) => s.id,
      ]);
    case "album":
      return sortBy(items, order, [
        (s) => s.albums[0]?.name,
        (s) => s.albums[0]?.track,
        (s) => s.title,
        (s) => s.id,
      ]);
    case "addedAt":
      return sortBy(items, order, [(s) => s.addedAt, (s) => s.id]);
  }
}

/**
 * The songs with these ids (in id order; missing ids are skipped), loaded
 * in one pass however many there are, as for the playback queue.
 */
export function getSongItems(db: LibraryDb, ids: readonly number[]) {
  const unique = uniqueIds(ids);
  if (unique.length === 0) return [];
  return loadSongItems(db, inArray(songs.id, unique));
}

export interface SongDetail extends SongListItem {
  liked: boolean;
  /** User playlists (and Liked Songs) containing the song. */
  playlistIds: number[];
}

export function getSong(db: LibraryDb, id: number) {
  const [item] = loadSongItems(db, eq(songs.id, id));
  if (!item) return null;
  const memberships = db
    .select({ id: playlists.id, kind: playlists.kind })
    .from(playlistSongs)
    .innerJoin(playlists, eq(playlists.id, playlistSongs.playlistId))
    .where(eq(playlistSongs.songId, id))
    .orderBy(playlists.id)
    .all();
  return {
    ...item,
    liked: memberships.some((p) => p.kind === "liked"),
    playlistIds: memberships.map((p) => p.id),
  };
}

/** Clears `modified_since_export` after the app wrote the tags into the files. */
export function markSongsExported(db: LibraryDb, ids: readonly number[]) {
  if (ids.length > 0) {
    db.update(songs)
      .set({ modifiedSinceExport: false })
      .where(inArray(songs.id, [...ids]))
      .run();
  }
  return written(undefined, ["songs"]);
}

export interface DeletedSongs {
  ids: number[];
  /** Folders (relative to `Documents/`) the app must delete after the commit. */
  deletePaths: string[];
}

/**
 * Deletes songs and (by cascade) their artist, album, and playlist rows.
 * Artists and albums left without songs are kept, as in 2.5.2.
 */
export function deleteSongs(
  db: LibraryDb,
  ids: readonly number[],
  options?: WriteOptions,
) {
  const now = nowFrom(options);
  const deleted = db.transaction((tx) => {
    const unique = uniqueIds(ids);
    if (unique.length === 0) return [];
    const affected = tx
      .selectDistinct({ id: playlistSongs.playlistId })
      .from(playlistSongs)
      .where(inArray(playlistSongs.songId, unique))
      .all()
      .map((r) => r.id);
    const rows = tx
      .delete(songs)
      .where(inArray(songs.id, unique))
      .returning({ id: songs.id })
      .all();
    if (affected.length > 0)
      tx.update(playlists)
        .set({ updatedAt: now })
        .where(inArray(playlists.id, affected))
        .run();
    return rows.map((r) => r.id).sort((a, b) => a - b);
  });
  return written(
    { ids: deleted, deletePaths: deleted.map((id) => artworkDir("song", id)) },
    ["songs", "song_artists", "album_songs", "playlist_songs", "playlists"],
  );
}
