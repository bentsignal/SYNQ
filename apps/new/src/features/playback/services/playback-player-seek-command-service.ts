import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import type { PlaybackState } from "../types/playback-state";
import {
  runPlaybackPlayerSeekCommand,
  type PlaybackPlayerSeekDirection,
} from "./playback-player-command-flow-service";

export const runPlaybackPlayerSeekFromStateCommand = ({
  direction,
  seekTo,
  sendHaptic,
  state,
}: {
  direction: PlaybackPlayerSeekDirection;
  seekTo: (position: number) => void;
  sendHaptic: (type: HapticFeedbackType) => void;
  state: Pick<PlaybackState, "duration" | "position">;
}) => {
  runPlaybackPlayerSeekCommand({
    direction,
    seekTo,
    sendHaptic,
    state: {
      duration: state.duration,
      position: state.position,
    },
  });
};
