import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";
import type { TrackPlayerAdapter } from "./track-player-adapter";
import {
  getActiveTrack,
  getNextQueueIndex,
  getPreviousTrack,
  getReplacementTrackAfterRemoval,
} from "./playback-queue-service";

export type PlaybackNativeCommandPlan =
  | { type: "noop" }
  | { type: "pause" }
  | { type: "play"; track: PlaybackQueueItem }
  | { type: "resume" }
  | { position: number; type: "seek" }
  | { type: "stop" };

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
  getActiveTrack(state) ? { type: "resume" } : { type: "noop" };

export const getSkipNextNativeCommandPlan = (
  state: PlaybackState,
): { command: PlaybackNativeCommandPlan; targetIndex: number | null } => {
  const targetIndex = getNextQueueIndex({
    activeQueueIndex: state.activeQueueIndex,
    loop: state.mode.loop,
    queue: state.queue,
    shuffle: state.mode.shuffle,
  });
  const nextTrack = targetIndex === null ? null : state.queue[targetIndex] ?? null;

  return {
    command: nextTrack ? { track: nextTrack, type: "play" } : { type: "stop" },
    targetIndex,
  };
};

export const getSkipPreviousNativeCommandPlan = (
  state: PlaybackState,
): PlaybackNativeCommandPlan => {
  const previousTrack = getPreviousTrack(state);

  return previousTrack
    ? { track: previousTrack, type: "play" }
    : { position: 0, type: "seek" };
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

  return replacementTrack && state.isPlaying
    ? { track: replacementTrack, type: "play" }
    : { type: "stop" };
};
