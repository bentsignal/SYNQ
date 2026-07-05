import {
  getCompletePlaybackAdBreakAction,
} from "./playback-ad-gate-service";
import {
  getPlaybackNativeStatusAction,
} from "./playback-native-transition-service";
import type { PlaybackAction } from "./playback-session-action-service";
import type { TrackPlayerStatusSnapshot } from "./playback-native-status-service";

export const runPlaybackNativeStatusCommand = ({
  dispatch,
  finishActiveTrack,
  premiumActive,
  resumeLibrary,
  runNativeCommand,
  status,
}: {
  dispatch: (action: PlaybackAction) => void;
  finishActiveTrack: () => void;
  premiumActive: boolean;
  resumeLibrary: () => Promise<void>;
  runNativeCommand: (command: () => Promise<void>) => void;
  status: TrackPlayerStatusSnapshot;
}) => {
  if (status.didJustFinish) {
    if (status.source === "ad") {
      dispatch(getCompletePlaybackAdBreakAction());
      runNativeCommand(resumeLibrary);
      return "completed-ad" as const;
    }

    finishActiveTrack();
    return "finished-track" as const;
  }

  dispatch(getPlaybackNativeStatusAction({ premiumActive, status }));
  return "updated-status" as const;
};
