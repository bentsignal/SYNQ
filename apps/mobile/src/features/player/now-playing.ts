import { usePlayer } from "./hooks";
import { isPlaying } from "./store";

/**
 * The song that's playing, for rows to mark it (accent title and a
 * `waveform` symbol). Null while nothing is loaded or the ad plays.
 */
export function useNowPlaying() {
  const songId = usePlayer((state) =>
    state.interstitial ? null : (state.current?.songId ?? null),
  );
  const playing = usePlayer((state) => isPlaying(state.status));
  return { playing, songId };
}
