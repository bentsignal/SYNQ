import type { PlayerSongs } from "./songs";
import { useLibraryQuery } from "~/features/library/queries";
import { PLAYER_SONGS_KEY, readPlayerSongs } from "./songs";

/**
 * Part of the queue's songs (a library query, so edits show at once).
 * `select` picks what the component needs.
 */
export function usePlayerSongs<Selected>(
  select: (songs: PlayerSongs) => Selected,
) {
  return useLibraryQuery({
    key: PLAYER_SONGS_KEY,
    read: readPlayerSongs,
    select,
  });
}

/** The song of the current entry, or null when nothing is loaded. */
export function useCurrentSong(songId: number | null) {
  return usePlayerSongs((songs) =>
    songId === null ? null : (songs.get(songId) ?? null),
  );
}
