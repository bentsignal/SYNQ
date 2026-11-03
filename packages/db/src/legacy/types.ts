/**
 * The importer's injected dependencies, kept tiny so the app backs them with
 * expo-sqlite and expo-file-system and node tests back them with
 * `node:sqlite` and `node:fs`.
 */

export type Awaitable<T> = T | Promise<T>;

export type LegacyRow = Record<string, unknown>;

/**
 * A read-only handle on the 2.5.2 database (`SQLite/synq.db`). The importer
 * only ever issues `SELECT` and `PRAGMA table_info`.
 */
export interface LegacyDatabase {
  all(
    sql: string,
    params?: readonly (string | number | null)[],
  ): Awaitable<LegacyRow[]>;
}

export interface LegacyFileStat {
  isDirectory: boolean;
  size: number;
  /** Milliseconds since the epoch, or null if unknown. */
  modifiedMs: number | null;
}

/**
 * Read-only file access. Paths are absolute (or at least whatever the
 * adapter resolves), joined with `/`.
 */
export interface LegacyFileSystem {
  exists(path: string): Awaitable<boolean>;
  /** Entry names in a directory; an empty list if it doesn't exist. */
  list(path: string): Awaitable<string[]>;
  /** Null if the path doesn't exist. */
  stat(path: string): Awaitable<LegacyFileStat | null>;
}

/** Adds text reads, which only the AsyncStorage reader needs. */
export interface LegacyTextFileSystem extends LegacyFileSystem {
  /** UTF-8 contents, or null if the file doesn't exist. */
  readText(path: string): Awaitable<string | null>;
}

export type LegacyImportWarningCode =
  /** A 2.5.2 table wasn't in the database (e.g. a pre-v2 or tampered file). */
  | "missing-table"
  /** A column was missing (e.g. `albumSongs.track` before 2.5.2's v2 migration). */
  | "missing-column"
  /** A row without a usable id was skipped. */
  | "invalid-row"
  /** `fileName` was empty, missing, or wrong; the only audio file in the song's folder was used. */
  | "audio-file-recovered"
  /** The title was empty (2.5.2 showed the file name instead); the file name without its extension became the title. */
  | "title-from-file-name"
  /** No audio file was found; the song was kept with its recorded path (or none). */
  | "audio-file-missing"
  /** A song row 2.5.2 never showed (absent from its hidden Library playlist) with no audio file: skipped. */
  | "hidden-song-skipped"
  /** A song row 2.5.2 never showed, but whose audio file exists: imported. */
  | "hidden-song-imported"
  /** The hidden Library playlist was empty, so every song row was treated as visible. */
  | "library-playlist-empty"
  /** Join rows pointing at a missing song, artist, album, or playlist were dropped. */
  | "orphan-join-rows"
  /** Repeated join rows were dropped, keeping the first. */
  | "duplicate-join-rows"
  /** An m4a track number stored packed with its total (`total << 16 | n`); decoded to `n`. */
  | "packed-track-number"
  /** Only one of `cover_full.jpg` / `cover_small.jpg` exists. */
  | "partial-artwork"
  /** Playlist 2 (Liked Songs) had no row; it was recreated with the default name. */
  | "liked-playlist-recreated"
  /** Folders under `library/`, `albums/`, ... with no matching row (left in place). */
  | "orphan-folders"
  /** AsyncStorage existed but some of it couldn't be read. */
  | "async-storage";

export interface LegacyImportWarning {
  code: LegacyImportWarningCode;
  message: string;
  /** Affected ids (songs, playlists, ...) where that makes sense. */
  ids?: number[];
}
