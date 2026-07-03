import { useEffect, useRef } from "react";
import {
  loadPersistedPlaybackState,
  savePersistedPlaybackState,
} from "../services/playback-persistence-service";
import {
  runPlaybackHydrateCommand,
  runPlaybackPersistenceCommand,
} from "../services/playback-persistence-command-flow-service";
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

    void runPlaybackHydrateCommand({
      dispatch,
      isCurrent: () => isMounted,
      loadPersistedPlaybackState,
      onRestorePlayingState,
    }).then((didHydrate) => {
      if (didHydrate) {
        hasHydratedRef.current = true;
      }
    });

    return () => {
      isMounted = false;
    };
  }, [dispatch, onRestorePlayingState]);

  useEffect(() => {
    void runPlaybackPersistenceCommand({
      hasHydrated: hasHydratedRef.current,
      lastPersistedAt: lastPersistedAtRef.current,
      now: Date.now(),
      savePersistedPlaybackState,
      state,
    }).then((lastPersistedAt) => {
      lastPersistedAtRef.current = lastPersistedAt;
    });
  }, [state]);
}
