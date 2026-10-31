/**
 * What the rest of the app asks of the player. Library screens call these
 * with song ids; the player loads the songs, builds native tracks, and
 * owns the queue from there (`@synq/audio`).
 *
 * Contract only, until the player lands: every function is a no-op.
 */

/** Where a queue came from, shown as "Playing from …" and kept across launches. */
export type PlaybackSource =
  | { kind: "library" }
  | { kind: "liked" }
  | { kind: "playlist"; id: number }
  | { kind: "album"; id: number }
  | { kind: "artist"; id: number }
  | { kind: "search" };

export interface PlayOptions {
  /** Index into `songIds` to start at; ignored when shuffling. */
  startIndex?: number;
  /** Shuffle the list (and turn shuffle on). */
  shuffle?: boolean;
  source: PlaybackSource;
}

/** Replaces the queue with `songIds` (in the order shown) and plays. */
export function playSongs(songIds: readonly number[], options: PlayOptions) {
  void songIds;
  void options;
}

/** Inserts songs right after the current one ("Play Next"). */
export function playNext(songIds: readonly number[]) {
  void songIds;
}

/** Appends songs to the end of Up Next ("Add to Queue"). */
export function addToQueue(songIds: readonly number[]) {
  void songIds;
}

/** Drops deleted songs from the queue (call after deleting from the library). */
export function forgetSongs(songIds: readonly number[]) {
  void songIds;
}
