import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import type { PlaybackState } from "../types/playback-state";
import {
  getPlaybackPlayerButtonCommand,
  getPlaybackPlayerPlayPauseCommand,
  getPlaybackPlayerSeekCommand,
} from "./playback-player-command-state-service";

type PlaybackPlayerCommandDependencies = {
  sendHaptic: (type: HapticFeedbackType) => void;
};

export type PlaybackPlayerSeekDirection = "backward" | "forward";

export const runPlaybackPlayerSeekCommand = ({
  direction,
  seekTo,
  sendHaptic,
  state,
}: PlaybackPlayerCommandDependencies & {
  direction: PlaybackPlayerSeekDirection;
  seekTo: (position: number) => void;
  state: Pick<PlaybackState, "duration" | "position">;
}) => {
  const command = getPlaybackPlayerSeekCommand({
    direction,
    state,
  });
  sendHaptic(command.haptic);
  seekTo(command.targetPosition);
};

export const runPlaybackPlayerButtonCommand = ({
  action,
  sendHaptic,
}: PlaybackPlayerCommandDependencies & {
  action: () => void;
}) => {
  sendHaptic(getPlaybackPlayerButtonCommand().haptic);
  action();
};

export const runPlaybackPlayerPlayPauseCommand = ({
  isPlaying,
  pause,
  resume,
  sendHaptic,
}: PlaybackPlayerCommandDependencies & {
  isPlaying: boolean;
  pause: () => void;
  resume: () => void;
}) => {
  const command = getPlaybackPlayerPlayPauseCommand({
    isPlaying,
  });
  sendHaptic(command.haptic);

  if (command.action === "pause") {
    pause();
    return;
  }

  resume();
};
