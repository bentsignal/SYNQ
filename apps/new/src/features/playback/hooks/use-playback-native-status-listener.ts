import { useEffect, type RefObject } from "react";
import { getCompletePlaybackAdBreakAction } from "../services/playback-ad-gate-service";
import { getPlaybackNativeStatusAction } from "../services/playback-native-transition-service";
import type { PlaybackAction } from "../services/playback-session-service";
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
      if (status.didJustFinish) {
        if (status.source === "ad") {
          dispatch(getCompletePlaybackAdBreakAction());
          runNativeCommand(() => adapter.resumeLibrary());
          return;
        }

        finishActiveTrack();
        return;
      }

      dispatch(getPlaybackNativeStatusAction({
        premiumActive: premiumActiveRef.current,
        status,
      }));
    });

    return () => {
      adapter.setStatusListener(null);
    };
  }, [adapter, dispatch, finishActiveTrack, premiumActiveRef, runNativeCommand]);
}
