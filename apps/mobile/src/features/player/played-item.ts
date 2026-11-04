import type { PlaybackSource } from "./types.ts";

/**
 * What a play puts at the top of the Library tab's Recents
 * (docs/rewrite.md → Home): the collection it came from, or, from the library
 * or a search, the song someone chose. Play or Shuffle on all of Songs chooses
 * no song, so it adds nothing.
 */
export function playedItem(
  source: PlaybackSource,
  chosenSongId: number | undefined,
) {
  switch (source.kind) {
    case "album":
    case "artist":
    case "playlist":
    case "liked":
      return source;
    case "library":
    case "search":
      return chosenSongId === undefined
        ? null
        : ({ id: chosenSongId, kind: "song" } as const);
  }
}
