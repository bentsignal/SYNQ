import { sql } from "drizzle-orm";

import type { LibraryDb } from "../client.ts";
import type { LibrarySnapshot } from "./types.ts";
import { libraryMigrations } from "../migrations.ts";
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

export function readLibrarySnapshot(db: LibraryDb) {
  return {
    songs: db.select().from(songs).orderBy(songs.id).all(),
    artists: db.select().from(artists).orderBy(artists.id).all(),
    albums: db.select().from(albums).orderBy(albums.id).all(),
    playlists: db.select().from(playlists).orderBy(playlists.id).all(),
    songArtists: db.select().from(songArtists).all(),
    albumSongs: db.select().from(albumSongs).all(),
    albumArtists: db.select().from(albumArtists).all(),
    playlistSongs: db
      .select()
      .from(playlistSongs)
      .orderBy(playlistSongs.playlistId, playlistSongs.position)
      .all(),
  } satisfies LibrarySnapshot;
}

/** Whether a backup's database was made by a newer SYNQ than this one. */
export function isNewerLibrarySchema(db: LibraryDb) {
  const newest = libraryMigrations.journal.entries.at(-1)?.when ?? 0;
  const table = db.all<{ name: string }>(
    sql`SELECT name FROM sqlite_master WHERE name = '__drizzle_migrations'`,
  );
  if (table.length === 0) return false;
  const [row] = db.all<{ newest: number | null }>(
    sql`SELECT max(created_at) AS newest FROM __drizzle_migrations`,
  );
  return (row?.newest ?? 0) > newest;
}
