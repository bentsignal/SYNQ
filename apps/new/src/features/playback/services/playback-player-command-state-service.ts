import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import type { PlaybackState } from "../types/playback-state";
import { getSeekTargetPosition } from "./playback-player-progress-service";

type PlaybackPlayerCommand = {
  haptic: HapticFeedbackType;
};

type PlaybackPlayerSeekCommand = PlaybackPlayerCommand & {
  targetPosition: number;
};

type PlaybackPlayerPlayPauseCommand = PlaybackPlayerCommand & {
  action: "pause" | "resume";
};

export const getPlaybackPlayerButtonCommand = (): PlaybackPlayerCommand => ({
  haptic: "light",
});

export const getPlaybackPlayerSeekCommand = ({
  direction,
  state,
}: {
  direction: "backward" | "forward";
  state: Pick<PlaybackState, "duration" | "position">;
}): PlaybackPlayerSeekCommand => ({
  haptic: "light",
  targetPosition: getSeekTargetPosition({
    direction,
    duration: state.duration,
    position: state.position,
  }),
});

export const getPlaybackPlayerPlayPauseCommand = ({
  isPlaying,
}: {
  isPlaying: boolean;
}): PlaybackPlayerPlayPauseCommand => ({
  action: isPlaying ? "pause" : "resume",
  haptic: isPlaying ? "soft" : "light",
});
