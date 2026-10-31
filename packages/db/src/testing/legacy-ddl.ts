/**
 * 2.5.2's exact DDL, extracted verbatim (whitespace included) from
 * `src/models/Model.ts` of the 2.5.2 release, in the order
 * `Model.createTables()` runs it. `v2AddTrack` is the v2 migration, which a
 * v1-era install never ran. Regenerate only if 2.5.2 itself changed (it
 * won't: it shipped).
 */
export const LEGACY_2_5_2_DDL = {
  songs:
    "\n        CREATE TABLE IF NOT EXISTS songs (\n          id INTEGER PRIMARY KEY AUTOINCREMENT,\n          title TEXT,\n          edited BOOLEAN DEFAULT FALSE,\n          artists TEXT,\n          album TEXT,\n          genre TEXT,\n          duration INTEGER,\n          fileType TEXT,\n          fileName TEXT\n        );\n      ",
  playlists:
    "\n        CREATE TABLE IF NOT EXISTS playlists (\n          id INTEGER PRIMARY KEY AUTOINCREMENT,\n          name TEXT\n        );\n      ",
  libraryPlaylist:
    "\n        INSERT INTO playlists (name)\n        SELECT 'Library'\n        WHERE NOT EXISTS (\n          SELECT 1 FROM playlists WHERE id = 1\n        );\n      ",
  likedPlaylist:
    "\n        INSERT INTO playlists (name)\n        SELECT 'Liked Songs'\n        WHERE NOT EXISTS (\n          SELECT 1 FROM playlists WHERE id = 2\n        );\n      ",
  playlistSongs:
    "\n        CREATE TABLE IF NOT EXISTS playlistSongs (\n          id INTEGER PRIMARY KEY AUTOINCREMENT,\n          playlistId INTEGER,\n          songId INTEGER\n        );\n      ",
  albums:
    "\n        CREATE TABLE IF NOT EXISTS albums (\n          id INTEGER PRIMARY KEY AUTOINCREMENT,\n          name TEXT,\n          year INTEGER\n        );\n      ",
  albumSongs:
    "\n        CREATE TABLE IF NOT EXISTS albumSongs (\n          id INTEGER PRIMARY KEY AUTOINCREMENT,\n          albumId INTEGER,\n          songId INTEGER\n        );\n      ",
  artists:
    "\n        CREATE TABLE IF NOT EXISTS artists (\n          id INTEGER PRIMARY KEY AUTOINCREMENT,\n          name TEXT\n        );\n      ",
  artistSongs:
    "\n        CREATE TABLE IF NOT EXISTS artistSongs (\n          id INTEGER PRIMARY KEY AUTOINCREMENT,\n          artistId INTEGER,\n          songId INTEGER \n        );\n      ",
  artistsAlbums:
    "\n        CREATE TABLE IF NOT EXISTS artistsAlbums (\n          id INTEGER PRIMARY KEY AUTOINCREMENT,\n          artistId INTEGER,\n          albumId INTEGER\n        );\n      ",
  v2AddTrack: "ALTER TABLE albumSongs ADD COLUMN track INTEGER;",
} as const;

/** `createTables()` order: every statement but the v2 migration. */
export const LEGACY_2_5_2_CREATE_ORDER = [
  "songs",
  "playlists",
  "libraryPlaylist",
  "likedPlaylist",
  "playlistSongs",
  "albums",
  "albumSongs",
  "artists",
  "artistSongs",
  "artistsAlbums",
] as const;
