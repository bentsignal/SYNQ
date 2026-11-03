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
