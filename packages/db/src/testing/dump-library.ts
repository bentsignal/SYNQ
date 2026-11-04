/** Every library table as plain rows in a stable order, for whole-library assertions. */
import { asc } from "drizzle-orm";

import type { LibraryDb } from "../client.ts";
import {
  albumArtists,
  albums,
  albumSongs,
  artists,
  playlists,
  playlistSongs,
  songArtists,
  songs,
} from "../schema.ts";

/**
 * Without a row's pin and last play: they're 3.0's, so 2.5.2's expected data
 * has neither, and `home.test.ts` checks an import leaves them blank.
 */
function library<Row extends { lastPlayedAt: unknown; pinnedAt: unknown }>(
  rows: readonly Row[],
) {
  return rows.map(
    ({ lastPlayedAt: _played, pinnedAt: _pinned, ...row }) => row,
  );
}

export function dumpLibrary(db: LibraryDb) {
  return {
    songs: library(db.select().from(songs).orderBy(asc(songs.id)).all()),
    artists: library(db.select().from(artists).orderBy(asc(artists.id)).all()),
    albums: library(db.select().from(albums).orderBy(asc(albums.id)).all()),
    playlists: library(
      db.select().from(playlists).orderBy(asc(playlists.id)).all(),
    ),
    songArtists: db
      .select()
      .from(songArtists)
      .orderBy(asc(songArtists.songId), asc(songArtists.position))
      .all(),
    albumSongs: db
      .select()
      .from(albumSongs)
      .orderBy(asc(albumSongs.songId), asc(albumSongs.position))
      .all(),
    albumArtists: db
      .select()
      .from(albumArtists)
      .orderBy(asc(albumArtists.albumId), asc(albumArtists.position))
      .all(),
    playlistSongs: db
      .select()
      .from(playlistSongs)
      .orderBy(asc(playlistSongs.playlistId), asc(playlistSongs.position))
      .all(),
  };
}
