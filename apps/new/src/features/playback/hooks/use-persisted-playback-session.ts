import { useEffect, useRef } from "react";
import {
  loadPersistedPlaybackState,
  savePersistedPlaybackState,
} from "../services/playback-persistence-service";
import type { PlaybackAction } from "../services/playback-session-service";
import type { PlaybackState } from "../types/playback-state";

export function usePersistedPlaybackSession({
  dispatch,
  onRestorePlayingState,
  state,
}: {
  dispatch: (action: PlaybackAction) => void;
  onRestorePlayingState: (state: PlaybackState) => void;
  state: PlaybackState;
}) {
  const hasHydratedRef = useRef(false);
  const lastPersistedAtRef = useRef(0);

  useEffect(() => {
    let isMounted = true;

    const hydratePlaybackState = async () => {
      const persistedState = await loadPersistedPlaybackState();
      if (!isMounted) {
        return;
      }

      hasHydratedRef.current = true;
      dispatch({ state: persistedState, type: "hydrate" });

      if (persistedState.isPlaying) {
        onRestorePlayingState(persistedState);
      }
    };

    void hydratePlaybackState();

    return () => {
      isMounted = false;
    };
  }, [dispatch, onRestorePlayingState]);

  useEffect(() => {
    if (!hasHydratedRef.current) {
      return;
    }

    const now = Date.now();
    const shouldPersistImmediately = !state.isPlaying;
    const shouldPersistProgress = now - lastPersistedAtRef.current > 5000;

    if (!shouldPersistImmediately && !shouldPersistProgress) {
      return;
    }

    lastPersistedAtRef.current = now;
    void savePersistedPlaybackState(state);
  }, [state]);
}
