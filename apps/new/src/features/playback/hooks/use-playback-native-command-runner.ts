import { useCallback } from "react";
import {
  getPlaybackNativeCommandErrorMessage,
  type PlaybackNativeCommandPlan,
} from "../services/playback-native-command-plan-service";
import { runPlaybackNativeCommandPlan } from "../services/playback-native-command-plan-service";
import type { PlaybackAction } from "../services/playback-session-service";
import type { TrackPlayerAdapter } from "../services/track-player-adapter";
import type { PlaybackState } from "../types/playback-state";

type UsePlaybackNativeCommandRunnerParams = {
  adapter: TrackPlayerAdapter;
  dispatch: (action: PlaybackAction) => void;
};

export function usePlaybackNativeCommandRunner({
  adapter,
  dispatch,
}: UsePlaybackNativeCommandRunnerParams) {
  const runNativeCommand = useCallback(
    (command: () => Promise<void>) => {
      void command().catch((error) => {
        dispatch({
          error: getPlaybackNativeCommandErrorMessage(error),
          type: "native-failure",
        });
      });
    },
    [dispatch],
  );

  const runNativeCommandPlan = useCallback(
    (plan: PlaybackNativeCommandPlan) => {
      runPlaybackNativeCommandPlan({ adapter, plan, runNativeCommand });
    },
    [adapter, runNativeCommand],
  );

  const restorePersistedPlaybackState = useCallback(
    (persistedState: PlaybackState) => {
      runNativeCommand(() => adapter.restore(persistedState));
    },
    [adapter, runNativeCommand],
  );

  const playNativeAdBreak = useCallback(() => {
    runNativeCommand(() => adapter.playAd());
  }, [adapter, runNativeCommand]);

  const resumeNativeLibraryAfterPremium = useCallback(() => {
    runNativeCommand(() => adapter.resumeLibrary());
  }, [adapter, runNativeCommand]);

  return {
    playNativeAdBreak,
    restorePersistedPlaybackState,
    resumeNativeLibraryAfterPremium,
    runNativeCommand,
    runNativeCommandPlan,
  };
}
