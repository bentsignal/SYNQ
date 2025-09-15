import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const songsTable = sqliteTable("songs", {
  id: int("id").primaryKey({ autoIncrement: true }),
  title: text("title"),
  edited: int("edited", { mode: "boolean" }).default(false),
  artists: text("artists"),
  album: text("album"),
  genre: text("genre"),
  duration: int("duration"),
  fileType: text("fileType"),
  fileName: text("fileName"),
});

export const playlistsTable = sqliteTable("playlists", {
  id: int("id").primaryKey({ autoIncrement: true }),
  name: text("name"),
});

export const playlistSongsTable = sqliteTable("playlistSongs", {
  id: int("id").primaryKey({ autoIncrement: true }),
  playlistId: int("playlistId"),
  songId: int("songId"),
});

export const albumsTable = sqliteTable("albums", {
  id: int("id").primaryKey({ autoIncrement: true }),
  name: text("name"),
  year: int("year"),
});

export const albumSongsTable = sqliteTable("albumSongs", {
  id: int("id").primaryKey({ autoIncrement: true }),
  albumId: int("albumId"),
  songId: int("songId"),
  track: int("track"),
});

export const artistsTable = sqliteTable("artists", {
  id: int("id").primaryKey({ autoIncrement: true }),
  name: text("name"),
});

export const artistSongsTable = sqliteTable("artistSongs", {
  id: int("id").primaryKey({ autoIncrement: true }),
  artistId: int("artistId"),
  songId: int("songId"),
});

export const artistsAlbumsTable = sqliteTable("artistsAlbums", {
  id: int("id").primaryKey({ autoIncrement: true }),
  artistId: int("artistId"),
  albumId: int("albumId"),
});
