import {
  getPlaybackNativeCommandErrorMessage,
  runPlaybackNativeCommandPlan,
  type PlaybackNativeCommandPlan,
} from "./playback-native-command-plan-service";
import { getPlaybackNativeFailureAction } from "./playback-native-transition-action-service";
import type { PlaybackAction } from "./playback-session-action-service";
import type { TrackPlayerAdapter } from "./track-player-adapter";
import type { PlaybackState } from "../types/playback-state";

type CreatePlaybackNativeCommandRunnerParams = {
  adapter: TrackPlayerAdapter;
  dispatch: (action: PlaybackAction) => void;
};

export type PlaybackNativeCommandRunner = {
  playNativeAdBreak: () => void;
  restorePersistedPlaybackState: (persistedState: PlaybackState) => void;
  resumeNativeLibraryAfterPremium: () => void;
  runNativeCommand: (command: () => Promise<void>) => void;
  runNativeCommandPlan: (plan: PlaybackNativeCommandPlan) => void;
};

export const createPlaybackNativeCommandRunner = ({
  adapter,
  dispatch,
}: CreatePlaybackNativeCommandRunnerParams): PlaybackNativeCommandRunner => {
  const runNativeCommand = (command: () => Promise<void>) => {
    void command().catch((error) => {
      dispatch(
        getPlaybackNativeFailureAction(
          getPlaybackNativeCommandErrorMessage(error),
        ),
      );
    });
  };

  return {
    playNativeAdBreak: () => {
      runNativeCommand(() => adapter.playAd());
    },
    restorePersistedPlaybackState: (persistedState) => {
      runNativeCommand(() => adapter.restore(persistedState));
    },
    resumeNativeLibraryAfterPremium: () => {
      runNativeCommand(() => adapter.resumeLibrary());
    },
    runNativeCommand,
    runNativeCommandPlan: (plan) => {
      runPlaybackNativeCommandPlan({ adapter, plan, runNativeCommand });
    },
  };
};
