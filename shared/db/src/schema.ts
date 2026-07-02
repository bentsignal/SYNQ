import { int, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const songs = sqliteTable("songs", {
  id: int("id").primaryKey({ autoIncrement: true }),
  title: text("title"),
  snapshotAtLastExport: text("snapshotAtLastExport"),
  duration: int("duration"),
  fileType: text("fileType"),
  pathToFile: text("pathToFile"),
  originalFileName: text("originalFileName"),
  ingestComplete: int("ingestComplete").default(0),
  coverImage: text().references(() => images.hash, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
});

export const images = sqliteTable(
  "images",
  {
    hash: text("hash").primaryKey(),
  },
  (table) => [uniqueIndex("unique_hash").on(table.hash)],
);

export const playlists = sqliteTable("playlists", {
  id: int("id").primaryKey({ autoIncrement: true }),
  name: text("name"),
  coverImage: text().references(() => images.hash, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
});

export const playlistSongs = sqliteTable("playlistSongs", {
  id: int("id").primaryKey({ autoIncrement: true }),
  playlistId: int("playlistId"),
  songId: int("songId"),
  position: int("position"),
});

export const albums = sqliteTable("albums", {
  id: int("id").primaryKey({ autoIncrement: true }),
  name: text("name"),
  year: int("year"),
  coverImage: text().references(() => images.hash, {
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
  profileImage: text().references(() => images.hash, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
});

export const artistSongs = sqliteTable("artistSongs", {
  id: int("id").primaryKey({ autoIncrement: true }),
  artistId: int("artistId"),
  songId: int("songId"),
  position: int("position"),
});

export const artistsAlbums = sqliteTable("artistsAlbums", {
  id: int("id").primaryKey({ autoIncrement: true }),
  artistId: int("artistId"),
  albumId: int("albumId"),
});
