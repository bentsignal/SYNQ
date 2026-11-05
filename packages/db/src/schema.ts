/**
 * The 3.0 library schema (`Documents/SQLite/library.db`), as specified in
 * `docs/rewrite.md` ("The 3.0 database").
 *
 * Ids of songs, albums, artists, and playlists are preserved from 2.5.2, so
 * every table that owns a folder under `Documents/` uses AUTOINCREMENT: SQLite
 * then never hands out an id twice, even after the newest row is deleted, and
 * a new song can't land in a stale `library/{id}/` folder that a failed delete
 * left behind.
 *
 * Join rows reference both sides with `ON DELETE CASCADE`, which only works
 * when the connection runs `PRAGMA foreign_keys = ON` (see `openLibraryDb`
 * in `expo.ts` and the README).
 */
import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import type { LegacySettings } from "./legacy/settings.ts";
import type { LegacyImportWarning } from "./legacy/types.ts";

/**
 * A song is one audio file under `Documents/library/{id}/`.
 *
 * `file_path` is relative to `Documents/` because the app container path
 * changes across updates. It is null only for rows imported from 2.5.2
 * whose audio file could not be located (kept so nothing is silently lost).
 */
export const songs = sqliteTable(
  "songs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull().default(""),
    filePath: text("file_path"),
    mimeType: text("mime_type"),
    durationMs: integer("duration_ms").notNull().default(0),
    /** Null when the song has no artwork of its own; otherwise a cache-busting number. */
    artworkVersion: integer("artwork_version"),
    /**
     * Whether its album's cover comes before its own artwork. Off, it shows only
     * its own (docs/rewrite.md → Song artwork).
     */
    useAlbumArtwork: integer("use_album_artwork", { mode: "boolean" })
      .notNull()
      .default(true),
    addedAt: integer("added_at").notNull(),
    /** 2.5.2's `edited`: tags changed in the app since the file was last exported. */
    modifiedSinceExport: integer("modified_since_export", { mode: "boolean" })
      .notNull()
      .default(false),
    /** When it was last started from here; null until then (docs/rewrite.md → Home). */
    lastPlayedAt: integer("last_played_at"),
    /** When it was pinned to the Library tab; null when it isn't. */
    pinnedAt: integer("pinned_at"),
  },
  (t) => [index("songs_added_at_idx").on(t.addedAt)],
);

export const artists = sqliteTable(
  "artists",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    artworkVersion: integer("artwork_version"),
    addedAt: integer("added_at").notNull(),
    /** When it was last started from here; null until then (docs/rewrite.md → Home). */
    lastPlayedAt: integer("last_played_at"),
    /** When it was pinned to the Library tab; null when it isn't. */
    pinnedAt: integer("pinned_at"),
  },
  // NOCASE so find-or-create on import is an index lookup.
  (t) => [index("artists_name_idx").on(sql`${t.name} COLLATE NOCASE`)],
);

export const albums = sqliteTable(
  "albums",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    year: integer("year"),
    artworkVersion: integer("artwork_version"),
    addedAt: integer("added_at").notNull(),
    /** When it was last started from here; null until then (docs/rewrite.md → Home). */
    lastPlayedAt: integer("last_played_at"),
    /** When it was pinned to the Library tab; null when it isn't. */
    pinnedAt: integer("pinned_at"),
  },
  (t) => [index("albums_name_idx").on(sql`${t.name} COLLATE NOCASE`)],
);

/** A song's artists, in credit order (`position` 0 is the first credited artist). */
export const songArtists = sqliteTable(
  "song_artists",
  {
    songId: integer("song_id")
      .notNull()
      .references(() => songs.id, { onDelete: "cascade" }),
    artistId: integer("artist_id")
      .notNull()
      .references(() => artists.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.songId, t.artistId] }),
    index("song_artists_artist_idx").on(t.artistId),
  ],
);

/**
 * A song's album: one each (`album_songs_song_idx` is unique; docs/rewrite.md →
 * One album per song). `track` orders an album's songs. `position` is from
 * when a song could have several, and is 0.
 */
export const albumSongs = sqliteTable(
  "album_songs",
  {
    albumId: integer("album_id")
      .notNull()
      .references(() => albums.id, { onDelete: "cascade" }),
    songId: integer("song_id")
      .notNull()
      .references(() => songs.id, { onDelete: "cascade" }),
    track: integer("track"),
    position: integer("position").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.albumId, t.songId] }),
    uniqueIndex("album_songs_song_idx").on(t.songId),
  ],
);

/** An album's artists, in credit order. */
export const albumArtists = sqliteTable(
  "album_artists",
  {
    albumId: integer("album_id")
      .notNull()
      .references(() => albums.id, { onDelete: "cascade" }),
    artistId: integer("artist_id")
      .notNull()
      .references(() => artists.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.albumId, t.artistId] }),
    index("album_artists_artist_idx").on(t.artistId),
  ],
);

export const playlistKinds = ["liked", "user"] as const;
export type PlaylistKind = (typeof playlistKinds)[number];

/**
 * Liked Songs is a playlist row with `kind = 'liked'` (at most one), so a
 * renamed Liked Songs and its order survive. 2.5.2's hidden "Library"
 * playlist is not a row: the library is the `songs` table.
 */
export const playlists = sqliteTable(
  "playlists",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    kind: text("kind", { enum: playlistKinds }).notNull().default("user"),
    artworkVersion: integer("artwork_version"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
    /** When it was last started from here; null until then (docs/rewrite.md → Home). */
    lastPlayedAt: integer("last_played_at"),
    /** When it was pinned to the Library tab; null when it isn't. */
    pinnedAt: integer("pinned_at"),
  },
  (t) => [
    check("playlists_kind_check", sql`${t.kind} IN ('liked', 'user')`),
    uniqueIndex("playlists_one_liked_idx")
      .on(t.kind)
      .where(sql`${t.kind} = 'liked'`),
    index("playlists_name_idx").on(sql`${t.name} COLLATE NOCASE`),
  ],
);

/**
 * `position` is REAL so moving a song writes one row (the midpoint of its new
 * neighbours). Unique per playlist; the `(playlist_id, position)` index is
 * also the order index.
 */
export const playlistSongs = sqliteTable(
  "playlist_songs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    playlistId: integer("playlist_id")
      .notNull()
      .references(() => playlists.id, { onDelete: "cascade" }),
    songId: integer("song_id")
      .notNull()
      .references(() => songs.id, { onDelete: "cascade" }),
    position: real("position").notNull(),
  },
  (t) => [
    uniqueIndex("playlist_songs_song_unique").on(t.playlistId, t.songId),
    uniqueIndex("playlist_songs_position_unique").on(t.playlistId, t.position),
    index("playlist_songs_song_idx").on(t.songId),
  ],
);

/** Where an import came from: the 2.5.2 install being upgraded, or a 2.5.2 backup zip. */
export type LegacyImportSource = "install" | "backup";

/** Row counts written by the importer, kept for support and the post-import check. */
export interface LegacyImportCounts {
  songs: number;
  artists: number;
  albums: number;
  playlists: number;
  songArtists: number;
  albumSongs: number;
  albumArtists: number;
  playlistSongs: number;
}

/**
 * One row per completed import from 2.5.2. Its presence is what makes the
 * importer a no-op. `settings` holds the AsyncStorage-derived preferences and
 * playback session so the app can (re)apply them to the kv-store even if it
 * was killed between committing this row and writing the kv-store.
 */
export const legacyImport = sqliteTable("legacy_import", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  source: text("source", { enum: ["install", "backup"] }).notNull(),
  importedAt: integer("imported_at").notNull(),
  legacyDbVersion: integer("legacy_db_version"),
  counts: text("counts", { mode: "json" })
    .$type<LegacyImportCounts>()
    .notNull(),
  /** `LegacySettings` as JSON; null for backups (they carry no AsyncStorage). */
  settings: text("settings", { mode: "json" }).$type<LegacySettings>(),
  /** `LegacyImportWarning[]` as JSON. */
  warnings: text("warnings", { mode: "json" })
    .$type<LegacyImportWarning[]>()
    .notNull(),
});

export type Song = typeof songs.$inferSelect;
export type Artist = typeof artists.$inferSelect;
export type Album = typeof albums.$inferSelect;
export type Playlist = typeof playlists.$inferSelect;
export type PlaylistSong = typeof playlistSongs.$inferSelect;
export type LegacyImportRow = typeof legacyImport.$inferSelect;
