import type { SQL } from "drizzle-orm";
import { and, asc, eq, inArray, notExists, sql } from "drizzle-orm";

import type { LibraryDb } from "../client.ts";
import type { ArtworkRef } from "./artwork.ts";
import type { LibraryTable, WriteOptions } from "./changes.ts";
import type { ArtistCredit, SongListItem } from "./song-items.ts";
import type { SortOrder } from "./text.ts";
import { albumArtists, albums, albumSongs, artists, songs } from "../schema.ts";
import {
  assertAlbumEditAllowed,
  assertUniqueAlbum,
} from "./album-uniqueness.ts";
import { artworkDir, artworkRef } from "./artwork.ts";
import { changesOf, nowFrom, written } from "./changes.ts";
import { LibraryError } from "./errors.ts";
import { requireName, uniqueIds } from "./find-or-create.ts";
import { loadSongItems, songSearchFields } from "./song-items.ts";
import { chunked, matchesSearch, sortBy } from "./text.ts";

export interface AlbumListItem {
  id: number;
  name: string;
  year: number | null;
  artwork: ArtworkRef | null;
  addedAt: number;
  artists: ArtistCredit[];
  songCount: number;
  durationMs: number;
  /** When it was pinned to the Library tab; null when it isn't. */
  pinnedAt: number | null;
}

export type AlbumSort = "name" | "year" | "addedAt";

export interface ListAlbumsOptions {
  sort?: AlbumSort;
  order?: SortOrder;
  /** Matches album name, artists, year, and song titles (as 2.5.2 did). */
  search?: string;
}

export function listAlbums(db: LibraryDb, options: ListAlbumsOptions = {}) {
  const items = loadAlbumItems(db);
  const filtered = options.search
    ? filterAlbums(db, items, options.search)
    : items;
  return sortAlbums(filtered, options.sort ?? "name", options.order ?? "asc");
}

export function sortAlbums(
  items: AlbumListItem[],
  sort: AlbumSort,
  order: SortOrder,
) {
  switch (sort) {
    case "name":
      return sortBy(items, order, [(a) => a.name, (a) => a.id]);
    case "year":
      return sortBy(items, order, [(a) => a.year, (a) => a.name, (a) => a.id]);
    case "addedAt":
      return sortBy(items, order, [(a) => a.addedAt, (a) => a.id]);
  }
}

function filterAlbums(db: LibraryDb, items: AlbumListItem[], search: string) {
  const titles = new Map<number, string[]>();
  for (const row of db
    .select({ albumId: albumSongs.albumId, title: songs.title })
    .from(albumSongs)
    .innerJoin(songs, eq(songs.id, albumSongs.songId))
    .all()) {
    const list = titles.get(row.albumId);
    if (list) list.push(row.title);
    else titles.set(row.albumId, [row.title]);
  }
  return items.filter((album) =>
    matchesSearch(search, [
      album.name,
      album.year === null ? null : String(album.year),
      ...album.artists.map((a) => a.name),
      ...(titles.get(album.id) ?? []),
    ]),
  );
}

export function getAlbum(db: LibraryDb, id: number) {
  return loadAlbumItems(db, eq(albums.id, id))[0] ?? null;
}

/** Albums matching `where` (a condition on `albums`) with artists, counts, and durations. */
export function loadAlbumItems(db: LibraryDb, where?: SQL) {
  const rows = db
    .select({
      id: albums.id,
      name: albums.name,
      year: albums.year,
      artworkVersion: albums.artworkVersion,
      addedAt: albums.addedAt,
      pinnedAt: albums.pinnedAt,
      songCount: sql<number>`count(${songs.id})`,
      durationMs: sql<number>`coalesce(sum(${songs.durationMs}), 0)`,
    })
    .from(albums)
    .leftJoin(albumSongs, eq(albumSongs.albumId, albums.id))
    .leftJoin(songs, eq(songs.id, albumSongs.songId))
    .where(where)
    .groupBy(albums.id)
    .orderBy(asc(albums.id))
    .all();
  const credits = db
    .select({
      albumId: albumArtists.albumId,
      id: artists.id,
      name: artists.name,
    })
    .from(albumArtists)
    .innerJoin(artists, eq(artists.id, albumArtists.artistId))
    .where(
      where
        ? inArray(
            albumArtists.albumId,
            db.select({ id: albums.id }).from(albums).where(where),
          )
        : undefined,
    )
    .orderBy(asc(albumArtists.albumId), asc(albumArtists.position))
    .all();
  const byAlbum = new Map<number, ArtistCredit[]>();
  for (const { albumId, ...credit } of credits) {
    const list = byAlbum.get(albumId);
    if (list) list.push(credit);
    else byAlbum.set(albumId, [credit]);
  }
  return rows.map(({ artworkVersion, ...row }) => ({
    ...row,
    artwork: artworkRef("album", row.id, artworkVersion),
    artists: byAlbum.get(row.id) ?? [],
  }));
}

export interface AlbumTrack extends SongListItem {
  /** The song's track number on this album. */
  track: number | null;
}

export interface ListAlbumTracksOptions {
  sort?: "track" | "title";
  order?: SortOrder;
  search?: string;
}

/** An album's songs in track order; songs without a track number follow, oldest first. */
export function listAlbumTracks(
  db: LibraryDb,
  albumId: number,
  options: ListAlbumTracksOptions = {},
) {
  const tracks = new Map(
    db
      .select({ songId: albumSongs.songId, track: albumSongs.track })
      .from(albumSongs)
      .where(eq(albumSongs.albumId, albumId))
      .all()
      .map((r) => [r.songId, r.track]),
  );
  const items = loadSongItems(
    db,
    inArray(
      songs.id,
      db
        .select({ id: albumSongs.songId })
        .from(albumSongs)
        .where(eq(albumSongs.albumId, albumId)),
    ),
  )
    .map((song) => ({ ...song, track: tracks.get(song.id) ?? null }))
    .filter((song) => matchesSearch(options.search, songSearchFields(song)));
  const order = options.order ?? "asc";
  return options.sort === "title"
    ? sortBy(items, order, [(s) => s.title, (s) => s.id])
    : sortBy(items, order, [(s) => s.track, (s) => s.addedAt, (s) => s.id]);
}

export interface AlbumInput {
  name: string;
  year?: number | null;
  /** Album artists in credit order. */
  artistIds?: readonly number[];
}

/**
 * Creates an album. Its name and artists are unique together, ignoring case:
 * two albums can share a name when they're by different artists.
 */
export function createAlbum(
  db: LibraryDb,
  input: AlbumInput,
  options?: WriteOptions,
) {
  const name = requireName(input.name, "Album");
  const id = db.transaction((tx) => {
    assertUniqueAlbum(tx, {
      artistIds: input.artistIds ?? [],
      currentName: null,
      exceptId: undefined,
      name,
    });
    const { id } = tx
      .insert(albums)
      .values({ name, year: input.year ?? null, addedAt: nowFrom(options) })
      .returning({ id: albums.id })
      .get();
    replaceAlbumArtists(tx, id, input.artistIds ?? []);
    return id;
  });
  return written(requireAlbum(db, id), ["albums", "album_artists"]);
}

export function updateAlbum(
  db: LibraryDb,
  id: number,
  input: Partial<AlbumInput>,
) {
  const changed = new Array<LibraryTable>("albums");
  db.transaction((tx) => {
    const current = tx
      .select({ name: albums.name })
      .from(albums)
      .where(eq(albums.id, id))
      .get();
    if (!current) throw new LibraryError("not-found", `No album ${id}`);
    const name =
      input.name === undefined ? undefined : requireName(input.name, "Album");
    assertAlbumEditAllowed(tx, {
      artistIds: input.artistIds,
      currentName: current.name,
      id,
      name,
    });
    const set = {
      ...(name !== undefined && { name }),
      ...(input.year !== undefined && { year: input.year }),
    };
    if (Object.keys(set).length > 0)
      tx.update(albums).set(set).where(eq(albums.id, id)).run();
    if (input.artistIds) {
      replaceAlbumArtists(tx, id, input.artistIds);
      changed.push("album_artists");
    }
    // Album name and year are written into its songs' tags on export.
    if (Object.keys(set).length > 0) {
      tx.update(songs)
        .set({ modifiedSinceExport: true })
        .where(
          inArray(
            songs.id,
            tx
              .select({ id: albumSongs.songId })
              .from(albumSongs)
              .where(eq(albumSongs.albumId, id)),
          ),
        )
        .run();
      changed.push("songs");
    }
  });
  return written(requireAlbum(db, id), changed);
}

/** Of these albums, the ones with no songs: a write's way to report what it emptied. */
export function listEmptyAlbums(db: LibraryDb, ids: readonly number[]) {
  return chunked(uniqueIds(ids)).flatMap((chunk) =>
    db
      .select({ id: albums.id, name: albums.name })
      .from(albums)
      .where(
        and(
          inArray(albums.id, chunk),
          notExists(
            db
              .select({ albumId: albumSongs.albumId })
              .from(albumSongs)
              .where(eq(albumSongs.albumId, albums.id)),
          ),
        ),
      )
      .all(),
  );
}

/** Deletes an album and its song and artist credits; its songs stay in the library. */
export function deleteAlbum(db: LibraryDb, id: number) {
  const deleted = changesOf(db.delete(albums).where(eq(albums.id, id)).run());
  if (deleted === 0) throw new LibraryError("not-found", `No album ${id}`);
  return written({ deletePaths: [artworkDir("album", id)] }, [
    "albums",
    "album_songs",
    "album_artists",
  ]);
}

function replaceAlbumArtists(
  db: LibraryDb,
  albumId: number,
  artistIds: readonly number[],
) {
  db.delete(albumArtists).where(eq(albumArtists.albumId, albumId)).run();
  const ids = uniqueIds(artistIds);
  if (ids.length > 0)
    db.insert(albumArtists)
      .values(
        ids.map((artistId, position) => ({ albumId, artistId, position })),
      )
      .run();
}

function requireAlbum(db: LibraryDb, id: number) {
  const album = getAlbum(db, id);
  if (!album) throw new LibraryError("not-found", `No album ${id}`);
  return album;
}
