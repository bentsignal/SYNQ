import type { SQL } from "drizzle-orm";
import { asc, eq, inArray, ne, sql } from "drizzle-orm";

import type { LibraryDb } from "../client.ts";
import type { AlbumListItem, AlbumSort } from "./albums.ts";
import type { ArtworkRef } from "./artwork.ts";
import type { WriteOptions } from "./changes.ts";
import type { SongListItem } from "./song-items.ts";
import type { SongSort } from "./songs.ts";
import type { SortOrder } from "./text.ts";
import {
  albumArtists,
  albums,
  albumSongs,
  artists,
  songArtists,
  songs,
} from "../schema.ts";
import { loadAlbumItems, sortAlbums } from "./albums.ts";
import { artworkDir, artworkRef } from "./artwork.ts";
import { changesOf, nowFrom, written } from "./changes.ts";
import { LibraryError } from "./errors.ts";
import { assertUniqueName, requireName } from "./find-or-create.ts";
import { loadSongItems, songSearchFields } from "./song-items.ts";
import { sortSongs } from "./songs.ts";
import { matchesSearch, sortBy } from "./text.ts";

export interface ArtistListItem {
  id: number;
  name: string;
  artwork: ArtworkRef | null;
  addedAt: number;
  songCount: number;
  albumCount: number;
  /** When it was pinned to the Library tab; null when it isn't. */
  pinnedAt: number | null;
}

export type ArtistSort = "name" | "addedAt";

export interface ListArtistsOptions {
  sort?: ArtistSort;
  order?: SortOrder;
  /** Matches artist name, song titles, and album names (as 2.5.2 did). */
  search?: string;
}

export function listArtists(db: LibraryDb, options: ListArtistsOptions = {}) {
  const items = loadArtistItems(db);
  const filtered = options.search
    ? filterArtists(db, items, options.search)
    : items;
  const order = options.order ?? "asc";
  return (options.sort ?? "name") === "name"
    ? sortBy(filtered, order, [(a) => a.name, (a) => a.id])
    : sortBy(filtered, order, [(a) => a.addedAt, (a) => a.id]);
}

function filterArtists(db: LibraryDb, items: ArtistListItem[], search: string) {
  const related = new Map<number, string[]>();
  function add(artistId: number, text: string) {
    const list = related.get(artistId);
    if (list) list.push(text);
    else related.set(artistId, [text]);
  }
  for (const row of db
    .select({
      artistId: songArtists.artistId,
      title: songs.title,
      album: albums.name,
    })
    .from(songArtists)
    .innerJoin(songs, eq(songs.id, songArtists.songId))
    .leftJoin(albumSongs, eq(albumSongs.songId, songs.id))
    .leftJoin(albums, eq(albums.id, albumSongs.albumId))
    .all()) {
    add(row.artistId, row.title);
    if (row.album) add(row.artistId, row.album);
  }
  return items.filter((artist) =>
    matchesSearch(search, [artist.name, ...(related.get(artist.id) ?? [])]),
  );
}

export function getArtist(db: LibraryDb, id: number) {
  return loadArtistItems(db, eq(artists.id, id))[0] ?? null;
}

/** Artists matching `where` (a condition on `artists`) with counts. */
export function loadArtistItems(db: LibraryDb, where?: SQL) {
  const songCount = db
    .select({
      artistId: songArtists.artistId,
      count: sql<number>`count(*)`.as("song_count"),
    })
    .from(songArtists)
    .groupBy(songArtists.artistId)
    .as("song_counts");
  const albumCount = db
    .select({
      artistId: albumArtists.artistId,
      count: sql<number>`count(*)`.as("album_count"),
    })
    .from(albumArtists)
    .groupBy(albumArtists.artistId)
    .as("album_counts");
  return db
    .select({
      id: artists.id,
      name: artists.name,
      artworkVersion: artists.artworkVersion,
      addedAt: artists.addedAt,
      pinnedAt: artists.pinnedAt,
      songCount: sql<number>`coalesce(${songCount.count}, 0)`,
      albumCount: sql<number>`coalesce(${albumCount.count}, 0)`,
    })
    .from(artists)
    .leftJoin(songCount, eq(songCount.artistId, artists.id))
    .leftJoin(albumCount, eq(albumCount.artistId, artists.id))
    .where(where)
    .orderBy(asc(artists.id))
    .all()
    .map(({ artworkVersion, ...row }) => ({
      ...row,
      artwork: artworkRef("artist", row.id, artworkVersion),
    }));
}

export interface ArtistDetailOptions {
  songSort?: SongSort;
  songOrder?: SortOrder;
  albumSort?: AlbumSort;
  albumOrder?: SortOrder;
  search?: string;
}

export interface ArtistDetail {
  artist: ArtistListItem;
  /** Songs crediting the artist (default newest first, like 2.5.2). */
  songs: SongListItem[];
  /** Albums crediting the artist. */
  albums: AlbumListItem[];
}

export function getArtistDetail(
  db: LibraryDb,
  id: number,
  options: ArtistDetailOptions = {},
) {
  const artist = getArtist(db, id);
  if (!artist) return null;
  const artistSongs = loadSongItems(
    db,
    inArray(
      songs.id,
      db
        .select({ id: songArtists.songId })
        .from(songArtists)
        .where(eq(songArtists.artistId, id)),
    ),
  ).filter((song) => matchesSearch(options.search, songSearchFields(song)));
  const artistAlbums = loadAlbumItems(
    db,
    inArray(
      albums.id,
      db
        .select({ id: albumArtists.albumId })
        .from(albumArtists)
        .where(eq(albumArtists.artistId, id)),
    ),
  ).filter((album) =>
    matchesSearch(options.search, [
      album.name,
      ...album.artists.map((a) => a.name),
    ]),
  );
  return {
    artist,
    songs: sortSongs(
      artistSongs,
      options.songSort ?? "addedAt",
      options.songOrder ?? "desc",
    ),
    albums: sortAlbums(
      artistAlbums,
      options.albumSort ?? "name",
      options.albumOrder ?? "asc",
    ),
  };
}

/** Creates an artist. Names are unique ignoring case (2.5.2 refused exact duplicates). */
export function createArtist(
  db: LibraryDb,
  name: string,
  options?: WriteOptions,
) {
  const cleaned = requireName(name, "Artist");
  const id = db.transaction((tx) => {
    assertUniqueArtistName(tx, cleaned, undefined, null);
    return tx
      .insert(artists)
      .values({ name: cleaned, addedAt: nowFrom(options) })
      .returning({ id: artists.id })
      .get().id;
  });
  return written(requireArtist(db, id), ["artists"]);
}

/** Renames an artist; its songs' tags are now stale, so they become modified since export. */
export function renameArtist(db: LibraryDb, id: number, name: string) {
  const cleaned = requireName(name, "Artist");
  db.transaction((tx) => {
    const current = tx
      .select({ name: artists.name })
      .from(artists)
      .where(eq(artists.id, id))
      .get();
    if (!current) throw new LibraryError("not-found", `No artist ${id}`);
    assertUniqueArtistName(tx, cleaned, id, current.name);
    tx.update(artists).set({ name: cleaned }).where(eq(artists.id, id)).run();
    tx.update(songs)
      .set({ modifiedSinceExport: true })
      .where(
        inArray(
          songs.id,
          tx
            .select({ id: songArtists.songId })
            .from(songArtists)
            .where(eq(songArtists.artistId, id)),
        ),
      )
      .run();
  });
  return written(requireArtist(db, id), ["artists", "songs"]);
}

/** Deletes an artist and its song and album credits; the songs and albums stay. */
export function deleteArtist(db: LibraryDb, id: number) {
  const deleted = changesOf(db.delete(artists).where(eq(artists.id, id)).run());
  if (deleted === 0) throw new LibraryError("not-found", `No artist ${id}`);
  return written({ deletePaths: [artworkDir("artist", id)] }, [
    "artists",
    "song_artists",
    "album_artists",
  ]);
}

function requireArtist(db: LibraryDb, id: number) {
  const artist = getArtist(db, id);
  if (!artist) throw new LibraryError("not-found", `No artist ${id}`);
  return artist;
}

function assertUniqueArtistName(
  db: LibraryDb,
  name: string,
  exceptId: number | undefined,
  currentName: string | null,
) {
  const others = db
    .select({ name: artists.name })
    .from(artists)
    .where(exceptId === undefined ? undefined : ne(artists.id, exceptId))
    .all();
  assertUniqueName(others, name, currentName, "An artist");
}
