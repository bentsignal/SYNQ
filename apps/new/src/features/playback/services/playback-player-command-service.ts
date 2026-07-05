import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import type { PlaybackState } from "../types/playback-state";
import { createPlaybackPlayerButtonControls } from "./playback-player-button-controls-service";
import { createPlaybackPlayerSeekControls } from "./playback-player-seek-controls-service";

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
  ...createPlaybackPlayerSeekControls({
    getState,
    seekTo,
    sendHaptic,
  }),
  ...createPlaybackPlayerButtonControls({
    getState,
    pause,
    resume,
    sendHaptic,
    skipNext,
    skipPrevious,
    toggleLoop,
    toggleShuffle,
  }),
});
