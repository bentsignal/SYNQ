import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import type { PlaybackState } from "../types/playback-state";
import { runPlaybackPlayerSeekFromStateCommand } from "./playback-player-seek-command-service";

export type PlaybackPlayerSeekControls = {
  fastForward: () => void;
  rewind: () => void;
};

export const createPlaybackPlayerSeekControls = ({
  getState,
  seekTo,
  sendHaptic,
}: {
  getState: () => Pick<PlaybackState, "duration" | "position">;
  seekTo: (position: number) => void;
  sendHaptic: (type: HapticFeedbackType) => void;
}): PlaybackPlayerSeekControls => ({
  fastForward: () => {
    runPlaybackPlayerSeekFromStateCommand({
      direction: "forward",
      seekTo,
      sendHaptic,
      state: getState(),
    });
  },
  rewind: () => {
    runPlaybackPlayerSeekFromStateCommand({
      direction: "backward",
      seekTo,
      sendHaptic,
      state: getState(),
    });
  },
});
