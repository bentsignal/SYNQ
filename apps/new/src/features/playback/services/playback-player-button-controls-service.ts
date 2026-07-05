import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import type { PlaybackState } from "../types/playback-state";
import {
  runPlaybackPlayerButtonCommand,
  runPlaybackPlayerPlayPauseCommand,
} from "./playback-player-command-flow-service";

export type PlaybackPlayerButtonControls = {
  skipBack: () => void;
  skipForward: () => void;
  toggleLoopMode: () => void;
  togglePlayPause: () => void;
  toggleShuffleMode: () => void;
};

export const createPlaybackPlayerButtonControls = ({
  getState,
  pause,
  resume,
  sendHaptic,
  skipNext,
  skipPrevious,
  toggleLoop,
  toggleShuffle,
}: {
  getState: () => Pick<PlaybackState, "isPlaying">;
  pause: () => void;
  resume: () => void;
  sendHaptic: (type: HapticFeedbackType) => void;
  skipNext: () => void;
  skipPrevious: () => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
}): PlaybackPlayerButtonControls => ({
  skipBack: () => {
    runPlaybackPlayerButtonCommand({
      action: skipPrevious,
      sendHaptic,
    });
  },
  skipForward: () => {
    runPlaybackPlayerButtonCommand({
      action: skipNext,
      sendHaptic,
    });
  },
  toggleLoopMode: () => {
    runPlaybackPlayerButtonCommand({
      action: toggleLoop,
      sendHaptic,
    });
  },
  togglePlayPause: () => {
    runPlaybackPlayerPlayPauseCommand({
      isPlaying: getState().isPlaying,
      pause,
      resume,
      sendHaptic,
    });
  },
  toggleShuffleMode: () => {
    runPlaybackPlayerButtonCommand({
      action: toggleShuffle,
      sendHaptic,
    });
  },
});
