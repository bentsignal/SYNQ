import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const songs = sqliteTable("songs", {
  id: int("id").primaryKey({ autoIncrement: true }),
  title: text("title"),
  snapshotAtLastExport: text(),
  duration: int("duration"),
  fileType: text("fileType"),
  fileName: text("fileName"),
});

export const playlists = sqliteTable("playlists", {
  id: int("id").primaryKey({ autoIncrement: true }),
  name: text("name"),
});

export const playlistSongs = sqliteTable("playlistSongs", {
  id: int("id").primaryKey({ autoIncrement: true }),
  playlistId: int("playlistId"),
  songId: int("songId"),
});

export const albums = sqliteTable("albums", {
  id: int("id").primaryKey({ autoIncrement: true }),
  name: text("name"),
  year: int("year"),
});

export const albumSongs = sqliteTable("albumSongs", {
  id: int("id").primaryKey({ autoIncrement: true }),
  albumId: int("albumId"),
  songId: int("songId"),
  track: int("track"),
});

export const artists = sqliteTable("artists", {
  id: int("id").primaryKey({ autoIncrement: true }),
  name: text("name"),
});

export const artistSongs = sqliteTable("artistSongs", {
  id: int("id").primaryKey({ autoIncrement: true }),
  artistId: int("artistId"),
  songId: int("songId"),
});

export const artistsAlbums = sqliteTable("artistsAlbums", {
  id: int("id").primaryKey({ autoIncrement: true }),
  artistId: int("artistId"),
  albumId: int("albumId"),
});
