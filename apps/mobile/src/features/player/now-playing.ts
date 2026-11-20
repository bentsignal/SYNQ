import { usePlayer } from "./hooks";
import { isPlaying } from "./store";

/**
 * Whether a row's song is the one loaded, for rows to mark it (accent title
 * and a `waveform` symbol): "playing", "paused", or null when it's another
 * song or nothing. Each row asks about its own song, so a skip re-renders the
 * two rows it changes, not every row on screen.
 */
export function useNowPlaying(songId: number) {
  return usePlayer((state) => {
    if (state.current?.songId !== songId) return null;
    return isPlaying(state.status) ? "playing" : "paused";
  });
}
