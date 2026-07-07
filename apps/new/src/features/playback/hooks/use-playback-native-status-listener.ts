import { useEffect, useRef, type RefObject } from "react";
import {
  shouldHandlePlaybackNativeFinishedStatus,
} from "../services/playback-native-finish-dedupe-service";
import { runPlaybackNativeStatusCommand } from "../services/playback-native-status-command-flow-service";
import type { PlaybackAction } from "../services/playback-session-action-service";
import type { TrackPlayerAdapter } from "../services/track-player-adapter";

type UsePlaybackNativeStatusListenerParams = {
  adapter: TrackPlayerAdapter;
  dispatch: (action: PlaybackAction) => void;
  finishActiveTrack: () => void;
  premiumActiveRef: RefObject<boolean>;
  runNativeCommand: (command: () => Promise<void>) => void;
};

export function usePlaybackNativeStatusListener({
  adapter,
  dispatch,
  finishActiveTrack,
  premiumActiveRef,
  runNativeCommand,
}: UsePlaybackNativeStatusListenerParams) {
  const handledFinishedStatusKeyRef = useRef<string | null>(null);

  useEffect(() => {
    adapter.setStatusListener((status) => {
      const { finishKey, shouldHandle } =
        shouldHandlePlaybackNativeFinishedStatus({
          handledKey: handledFinishedStatusKeyRef.current,
          status,
        });

      if (!shouldHandle) {
        return;
      }

      handledFinishedStatusKeyRef.current = finishKey;

      runPlaybackNativeStatusCommand({
        dispatch,
        finishActiveTrack,
        premiumActive: premiumActiveRef.current,
        resumeLibrary: adapter.resumeLibrary,
        runNativeCommand,
        status,
      });
    });

    return () => {
      handledFinishedStatusKeyRef.current = null;
      adapter.setStatusListener(null);
    };
  }, [adapter, dispatch, finishActiveTrack, premiumActiveRef, runNativeCommand]);
}
