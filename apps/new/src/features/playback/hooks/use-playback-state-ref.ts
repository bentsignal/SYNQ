import { useEffect, useRef, type RefObject } from "react";
import type { PlaybackState } from "../types/playback-state";

export function usePlaybackStateRef(
  state: PlaybackState,
): RefObject<PlaybackState> {
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  return stateRef;
}
