import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import type { PlaybackState } from "../types/playback-state";
import {
  runPlaybackPlayerButtonCommand,
  runPlaybackPlayerPlayPauseCommand,
  runPlaybackPlayerSeekCommand,
} from "./playback-player-command-flow-service";

type PlaybackPlayerSessionCommands = {
  pause: () => void;
  resume: () => void;
  seekTo: (position: number) => void;
  skipNext: () => void;
  skipPrevious: () => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
};

export type PlaybackPlayerCommands = {
  fastForward: () => void;
  rewind: () => void;
  skipBack: () => void;
  skipForward: () => void;
  toggleLoopMode: () => void;
  togglePlayPause: () => void;
  toggleShuffleMode: () => void;
};

type CreatePlaybackPlayerCommandsParams = PlaybackPlayerSessionCommands & {
  getState: () => Pick<PlaybackState, "duration" | "isPlaying" | "position">;
  sendHaptic: (type: HapticFeedbackType) => void;
};

export const createPlaybackPlayerCommands = ({
  getState,
  pause,
  resume,
  seekTo,
  sendHaptic,
  skipNext,
  skipPrevious,
  toggleLoop,
  toggleShuffle,
}: CreatePlaybackPlayerCommandsParams): PlaybackPlayerCommands => ({
  fastForward: () => {
    const state = getState();
    runPlaybackPlayerSeekCommand({
      direction: "forward",
      seekTo,
      sendHaptic,
      state: {
        duration: state.duration,
        position: state.position,
      },
    });
  },
  rewind: () => {
    const state = getState();
    runPlaybackPlayerSeekCommand({
      direction: "backward",
      seekTo,
      sendHaptic,
      state: {
        duration: state.duration,
        position: state.position,
      },
    });
  },
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
