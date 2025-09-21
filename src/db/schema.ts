import { int, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const songs = sqliteTable("songs", {
  id: int("id").primaryKey({ autoIncrement: true }),
  title: text("title"),
  snapshotAtLastExport: text("snapshotAtLastExport"),
  duration: int("duration"),
  fileType: text("fileType"),
  fileName: text("fileName"),
  coverImage: int("coverImageId").references(() => images.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
});

export const images = sqliteTable(
  "images",
  {
    id: int("id").primaryKey({ autoIncrement: true }),
    hash: text("hash"),
  },
  (table) => [uniqueIndex("unique_hash").on(table.hash)],
);

export const playlists = sqliteTable("playlists", {
  id: int("id").primaryKey({ autoIncrement: true }),
  name: text("name"),
  coverImage: int("coverImageId").references(() => images.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
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
  coverImage: int("coverImageId").references(() => images.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
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
  profileImage: int("profileImageId").references(() => images.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
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
