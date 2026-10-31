import { and, asc, eq, inArray, ne, sql } from "drizzle-orm";

import type { LibraryDb } from "../client.ts";
import type { PlaylistKind } from "../schema.ts";
import type { ArtworkRef } from "./artwork.ts";
import type { WriteOptions } from "./changes.ts";
import type { SongListItem } from "./song-items.ts";
import type { SongSort } from "./songs.ts";
import type { SortOrder } from "./text.ts";
import { playlists, playlistSongs, songs } from "../schema.ts";
import { artworkDir, artworkRef } from "./artwork.ts";
import { changesOf, nowFrom, written } from "./changes.ts";
import { LibraryError } from "./errors.ts";
import { assertUniqueName, requireName } from "./find-or-create.ts";
import {
  addSongsToPlaylist,
  removeSongsFromPlaylist,
} from "./playlist-songs.ts";
import { loadSongItems, songSearchFields } from "./song-items.ts";
import { sortSongs } from "./songs.ts";
import { matchesSearch, sortBy } from "./text.ts";

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
export function listPlaylists(
  db: LibraryDb,
  options: ListPlaylistsOptions = {},
) {
  const items = selectPlaylists(db).filter((p) =>
    matchesSearch(options.search, [p.name]),
  );
  const order = options.order ?? "desc";
  const sorted =
    (options.sort ?? "createdAt") === "name"
      ? sortBy(items, order, [(p) => p.name, (p) => p.id])
      : sortBy(items, order, [(p) => p.createdAt, (p) => p.id]);
  return [
    ...sorted.filter((p) => p.kind === "liked"),
    ...sorted.filter((p) => p.kind !== "liked"),
  ];
}

export function getPlaylist(db: LibraryDb, id: number) {
  return selectPlaylists(db, eq(playlists.id, id))[0] ?? null;
}

function selectPlaylists(db: LibraryDb, where?: ReturnType<typeof eq>) {
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
    .map(({ artworkVersion, ...row }) => ({
      ...row,
      artwork: artworkRef("playlist", row.id, artworkVersion),
    }));
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
) {
  const entries = db
    .select({
      entryId: playlistSongs.id,
      songId: playlistSongs.songId,
      position: playlistSongs.position,
    })
    .from(playlistSongs)
    .where(eq(playlistSongs.playlistId, playlistId))
    .orderBy(asc(playlistSongs.position))
    .all();
  const songsById = new Map(
    loadSongItems(
      db,
      inArray(
        songs.id,
        db
          .select({ id: playlistSongs.songId })
          .from(playlistSongs)
          .where(eq(playlistSongs.playlistId, playlistId)),
      ),
    ).map((song) => [song.id, song]),
  );
  const items = entries.flatMap(({ entryId, songId, position }) => {
    const song = songsById.get(songId);
    return song ? [{ ...song, entryId, position }] : [];
  });
  const filtered = items.filter((song) =>
    matchesSearch(options.search, songSearchFields(song)),
  );
  const sort = options.sort ?? "position";
  const order = options.order ?? "asc";
  if (sort === "position")
    return order === "asc" ? filtered : filtered.reverse();
  return sortSongs(filtered, sort, order);
}

/** The Liked Songs playlist id, creating the playlist if it doesn't exist. Call at startup, after the legacy import. */
export function ensureLikedPlaylist(db: LibraryDb, options?: WriteOptions) {
  const existing = findLikedPlaylistId(db);
  if (existing !== null) return written(existing, []);
  const now = nowFrom(options);
  const { id } = db
    .insert(playlists)
    .values({
      name: LIKED_SONGS_NAME,
      kind: "liked",
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: playlists.id })
    .get();
  return written(id, ["playlists"]);
}

export function findLikedPlaylistId(db: LibraryDb) {
  return (
    db
      .select({ id: playlists.id })
      .from(playlists)
      .where(eq(playlists.kind, "liked"))
      .get()?.id ?? null
  );
}

export function isSongLiked(db: LibraryDb, songId: number) {
  return !!db
    .select({ id: playlistSongs.id })
    .from(playlistSongs)
    .innerJoin(playlists, eq(playlists.id, playlistSongs.playlistId))
    .where(and(eq(playlists.kind, "liked"), eq(playlistSongs.songId, songId)))
    .get();
}

/** Likes or unlikes a song (adds it to the end of Liked Songs, or removes it). */
export function setSongLiked(
  db: LibraryDb,
  songId: number,
  liked: boolean,
  options?: WriteOptions,
) {
  return db.transaction((tx) => {
    const likedId = ensureLikedPlaylist(tx, options).value;
    const result = liked
      ? addSongsToPlaylist(tx, likedId, [songId], options)
      : removeSongsFromPlaylist(tx, likedId, [songId], options);
    return written(undefined, result.changed);
  });
}

export function createPlaylist(
  db: LibraryDb,
  name: string,
  options?: WriteOptions,
) {
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
export function renamePlaylist(
  db: LibraryDb,
  id: number,
  name: string,
  options?: WriteOptions,
) {
  const cleaned = requireName(name, "Playlist");
  db.transaction((tx) => {
    const current = tx
      .select({ name: playlists.name })
      .from(playlists)
      .where(eq(playlists.id, id))
      .get();
    if (!current) throw new LibraryError("not-found", `No playlist ${id}`);
    assertUniquePlaylistName(tx, cleaned, id, current.name);
    const updated = changesOf(
      tx
        .update(playlists)
        .set({ name: cleaned, updatedAt: nowFrom(options) })
        .where(eq(playlists.id, id))
        .run(),
    );
    if (updated === 0) throw new LibraryError("not-found", `No playlist ${id}`);
  });
  return written(requirePlaylist(db, id), ["playlists"]);
}

/** Deletes a user playlist and its entries. Liked Songs can't be deleted. */
export function deletePlaylist(db: LibraryDb, id: number) {
  db.transaction((tx) => {
    const row = tx
      .select({ kind: playlists.kind })
      .from(playlists)
      .where(eq(playlists.id, id))
      .get();
    if (!row) throw new LibraryError("not-found", `No playlist ${id}`);
    if (row.kind === "liked")
      throw new LibraryError("liked-playlist", "Liked Songs can't be deleted");
    tx.delete(playlists).where(eq(playlists.id, id)).run();
  });
  return written({ deletePaths: [artworkDir("playlist", id)] }, [
    "playlists",
    "playlist_songs",
  ]);
}

function requirePlaylist(db: LibraryDb, id: number) {
  const playlist = getPlaylist(db, id);
  if (!playlist) throw new LibraryError("not-found", `No playlist ${id}`);
  return playlist;
}

/** 2.5.2 refused duplicate playlist names; 3.0 does too, ignoring case. */
function assertUniquePlaylistName(
  db: LibraryDb,
  name: string,
  exceptId: number | undefined,
  currentName: string | null,
) {
  const others = db
    .select({ name: playlists.name })
    .from(playlists)
    .where(exceptId === undefined ? undefined : ne(playlists.id, exceptId))
    .all();
  assertUniqueName(others, name, currentName, "A playlist");
}
