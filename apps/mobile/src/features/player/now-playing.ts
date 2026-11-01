import { usePlayer } from "./hooks";
import { isPlaying } from "./store";

/**
 * The song that's playing, for rows to mark it (accent title and a
 * `waveform` symbol). Null while nothing is loaded.
 */
export function useNowPlaying() {
  const songId = usePlayer((state) => state.current?.songId ?? null);
  const playing = usePlayer((state) => isPlaying(state.status));
  return { playing, songId };
}
