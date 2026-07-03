import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";

type PlaybackQueueCommand = {
  haptic: HapticFeedbackType;
};

export const getPlaybackQueuePlayCommand = (): PlaybackQueueCommand => ({
  haptic: "light",
});

export const getPlaybackQueueMoveCommand = (): PlaybackQueueCommand => ({
  haptic: "light",
});

export const getPlaybackQueueRemoveCommand = (): PlaybackQueueCommand => ({
  haptic: "medium",
});

export const getPlaybackQueueClearCommand = (): PlaybackQueueCommand => ({
  haptic: "medium",
});
