import { useEffect, type RefObject } from "react";
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
  useEffect(() => {
    adapter.setStatusListener((status) => {
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
      adapter.setStatusListener(null);
    };
  }, [adapter, dispatch, finishActiveTrack, premiumActiveRef, runNativeCommand]);
}
