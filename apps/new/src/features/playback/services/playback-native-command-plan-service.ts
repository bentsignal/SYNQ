import type { PlaybackState } from "../types/playback-state";
import {
  getActiveTrack,
  getNextQueueIndex,
  getPreviousTrack,
  getReplacementTrackAfterRemoval,
} from "./playback-queue-selection-service";
import {
  getPlaybackNativePreviousCommandPlan,
  getPlaybackNativeReplacementCommandPlan,
  getPlaybackNativeResumeCommandPlan,
  getPlaybackNativeTargetCommandPlan,
  type PlaybackNativeCommandPlan,
} from "./playback-native-command-step-service";

export type { PlaybackNativeCommandPlan } from "./playback-native-command-step-service";
export { runPlaybackNativeCommandPlan } from "./playback-native-command-plan-runner-service";

export const getPlaybackNativeCommandErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Playback command failed.";

export const getResumeNativeCommandPlan = (
  state: PlaybackState,
): PlaybackNativeCommandPlan =>
  getPlaybackNativeResumeCommandPlan({ activeTrack: getActiveTrack(state) });

export const getSkipNextNativeCommandPlan = (
  state: PlaybackState,
): { command: PlaybackNativeCommandPlan; targetIndex: number | null } => {
  const targetIndex = getNextQueueIndex({
    activeQueueIndex: state.activeQueueIndex,
    loop: state.mode.loop,
    queue: state.queue,
    shuffle: state.mode.shuffle,
  });

  return getPlaybackNativeTargetCommandPlan({
    queue: state.queue,
    targetIndex,
  });
};

export const getSkipPreviousNativeCommandPlan = (
  state: PlaybackState,
): PlaybackNativeCommandPlan => {
  const previousTrack = getPreviousTrack(state);

  return getPlaybackNativePreviousCommandPlan({ previousTrack });
};

export const getRemoveFromQueueNativeCommandPlan = ({
  songId,
  state,
}: {
  songId: number;
  state: PlaybackState;
}): PlaybackNativeCommandPlan => {
  if (state.activeTrackId !== songId) {
    return { type: "noop" };
  }

  const replacementTrack = getReplacementTrackAfterRemoval({
    songId,
    state,
  });

  return getPlaybackNativeReplacementCommandPlan({
    isPlaying: state.isPlaying,
    replacementTrack,
  });
};
