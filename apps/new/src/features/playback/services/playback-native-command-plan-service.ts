import type { PlaybackState } from "../types/playback-state";
import type { TrackPlayerAdapter } from "./track-player-adapter";
import {
  getActiveTrack,
  getNextQueueIndex,
  getPreviousTrack,
  getReplacementTrackAfterRemoval,
} from "./playback-queue-service";
import {
  getPlaybackNativePreviousCommandPlan,
  getPlaybackNativeReplacementCommandPlan,
  getPlaybackNativeResumeCommandPlan,
  getPlaybackNativeTargetCommandPlan,
  type PlaybackNativeCommandPlan,
} from "./playback-native-command-step-service";

export type { PlaybackNativeCommandPlan } from "./playback-native-command-step-service";

export const getPlaybackNativeCommandErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Playback command failed.";

export const runPlaybackNativeCommandPlan = ({
  adapter,
  plan,
  runNativeCommand,
}: {
  adapter: TrackPlayerAdapter;
  plan: PlaybackNativeCommandPlan;
  runNativeCommand: (command: () => Promise<void>) => void;
}) => {
  switch (plan.type) {
    case "noop":
      return;
    case "pause":
      runNativeCommand(() => adapter.pause());
      return;
    case "play":
      runNativeCommand(() => adapter.play(plan.track));
      return;
    case "resume":
      runNativeCommand(() => adapter.resume());
      return;
    case "seek":
      runNativeCommand(() => adapter.seekTo(plan.position));
      return;
    case "stop":
      runNativeCommand(() => adapter.stop());
      return;
  }
};

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
