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
  /**
   * `true` shuffles the list from a random song and turns shuffle on (a
   * Shuffle button); `false` plays in order and turns it off. Left out,
   * the shuffle setting decides: on, the chosen song plays first and the
   * rest follow shuffled.
   */
  shuffle?: boolean;
  source: PlaybackSource;
}
