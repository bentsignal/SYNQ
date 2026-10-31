/**
 * Loads songs with their artists, albums, and resolved artwork in three
 * queries (songs, artist credits, album credits) instead of one per song,
 * the N+1 pattern 2.5.2's models used.
 */
import { asc, eq, inArray, type SQL } from "drizzle-orm";

import type { LibraryDb } from "../client.ts";
import { albums, albumSongs, artists, songArtists, songs, type Song } from "../schema.ts";
import { artworkRef, type ArtworkRef } from "./artwork.ts";

export interface ArtistCredit {
  id: number;
  name: string;
}

export interface AlbumCredit {
  id: number;
  name: string;
  track: number | null;
  artworkVersion: number | null;
}

export interface SongListItem {
  id: number;
  title: string;
  filePath: string | null;
  mimeType: string | null;
  durationMs: number;
  addedAt: number;
  modifiedSinceExport: boolean;
  /** Credit order. */
  artists: ArtistCredit[];
  /** The song's album order; the first is its primary album. */
  albums: AlbumCredit[];
  /** First album (by album order) with artwork, else the song's own, else null (placeholder). */
  artwork: ArtworkRef | null;
}

/**
 * Songs matching `where` (a condition on `songs`), in id order. Passing the
 * condition (not an id list) keeps the credit queries to one statement
 * however large the library is.
 */
export function loadSongItems(db: LibraryDb, where?: SQL): SongListItem[] {
  const rows = db.select().from(songs).where(where).orderBy(asc(songs.id)).all();
  if (rows.length === 0) return [];
  const scope = where ? inArray(songArtists.songId, db.select({ id: songs.id }).from(songs).where(where)) : undefined;
  const albumScope = where ? inArray(albumSongs.songId, db.select({ id: songs.id }).from(songs).where(where)) : undefined;

  const artistRows = db
    .select({ songId: songArtists.songId, id: artists.id, name: artists.name })
    .from(songArtists)
    .innerJoin(artists, eq(artists.id, songArtists.artistId))
    .where(scope)
    .orderBy(asc(songArtists.songId), asc(songArtists.position))
    .all();
  const albumRows = db
    .select({
      songId: albumSongs.songId,
      id: albums.id,
      name: albums.name,
      track: albumSongs.track,
      artworkVersion: albums.artworkVersion,
    })
    .from(albumSongs)
    .innerJoin(albums, eq(albums.id, albumSongs.albumId))
    .where(albumScope)
    .orderBy(asc(albumSongs.songId), asc(albumSongs.position))
    .all();

  const artistsBySong = group(artistRows, ({ songId, ...credit }) => [songId, credit]);
  const albumsBySong = group(albumRows, ({ songId, ...credit }) => [songId, credit]);
  return rows.map((row) => toSongItem(row, artistsBySong.get(row.id) ?? [], albumsBySong.get(row.id) ?? []));
}

export function toSongItem(row: Song, artistCredits: ArtistCredit[], albumCredits: AlbumCredit[]): SongListItem {
  return {
    id: row.id,
    title: row.title,
    filePath: row.filePath,
    mimeType: row.mimeType,
    durationMs: row.durationMs,
    addedAt: row.addedAt,
    modifiedSinceExport: row.modifiedSinceExport,
    artists: artistCredits,
    albums: albumCredits,
    artwork: resolveSongArtwork(row, albumCredits),
  };
}

/** 2.5.2's precedence: the first of the song's albums that has artwork, else the song's own. */
export function resolveSongArtwork(
  song: Pick<Song, "id" | "artworkVersion">,
  albumCredits: readonly AlbumCredit[],
): ArtworkRef | null {
  const album = albumCredits.find((credit) => credit.artworkVersion !== null);
  if (album) return artworkRef("album", album.id, album.artworkVersion);
  return artworkRef("song", song.id, song.artworkVersion);
}

function group<R, V>(rows: readonly R[], split: (row: R) => [number, V]): Map<number, V[]> {
  const result = new Map<number, V[]>();
  for (const row of rows) {
    const [key, value] = split(row);
    const list = result.get(key);
    if (list) list.push(value);
    else result.set(key, [value]);
  }
  return result;
}

/** Search fields for a song: title, artist names, album names. */
export function songSearchFields(song: SongListItem): string[] {
  return [song.title, ...song.artists.map((a) => a.name), ...song.albums.map((a) => a.name)];
}
