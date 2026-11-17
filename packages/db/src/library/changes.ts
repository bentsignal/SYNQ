/**
 * Every write returns the tables it touched so the app can invalidate exactly
 * the TanStack queries that read them (see the README's query-key table).
 */
export type LibraryTable =
  | "songs"
  | "artists"
  | "albums"
  | "song_artists"
  | "album_songs"
  | "album_artists"
  | "playlists"
  | "playlist_songs";

/**
 * What reads of songs, albums, and artists depend on: every table but the
 * playlists'. A playlist write (a like, an add, a reorder) changes none of
 * them, so the app's whole-library lists skip refreshing for it.
 */
export const CATALOG_TABLES = [
  "songs",
  "artists",
  "albums",
  "song_artists",
  "album_songs",
  "album_artists",
] as const satisfies readonly LibraryTable[];

export interface WriteResult<T> {
  value: T;
  /** Tables whose rows this write inserted, updated, or deleted (cascades included). */
  changed: LibraryTable[];
}

export function written<T>(value: T, changed: Iterable<LibraryTable>) {
  return { value, changed: [...new Set(changed)].sort() };
}

/** Options shared by writes; `now` is injectable so tests are deterministic. */
export interface WriteOptions {
  now?: number;
}

export function nowFrom(options: WriteOptions | undefined) {
  return options?.now ?? Date.now();
}

/** Rows a `.run()` touched. Drizzle types the run result per driver, so this reads it defensively. */
export function changesOf(result: unknown) {
  return typeof result === "object" &&
    result !== null &&
    "changes" in result &&
    typeof result.changes === "number"
    ? result.changes
    : 0;
}
