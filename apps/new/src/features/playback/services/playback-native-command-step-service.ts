import type { PlaybackQueueItem } from "../types/playback-state";

export type PlaybackNativeCommandPlan =
  | { type: "noop" }
  | { type: "pause" }
  | { type: "play"; track: PlaybackQueueItem }
  | { type: "resume" }
  | { position: number; type: "seek" }
  | { type: "stop" };

export const getPlaybackNativeResumeCommandPlan = ({
  activeTrack,
}: {
  activeTrack: PlaybackQueueItem | null;
}): PlaybackNativeCommandPlan =>
  activeTrack ? { type: "resume" } : { type: "noop" };

export const getPlaybackNativeTargetCommandPlan = ({
  queue,
  targetIndex,
}: {
  queue: PlaybackQueueItem[];
  targetIndex: number | null;
}): {
  command: PlaybackNativeCommandPlan;
  targetIndex: number | null;
} => {
  const nextTrack = targetIndex === null ? null : queue[targetIndex] ?? null;

  return {
    command: nextTrack ? { track: nextTrack, type: "play" } : { type: "stop" },
    targetIndex,
  };
};

export const getPlaybackNativePreviousCommandPlan = ({
  previousTrack,
}: {
  previousTrack: PlaybackQueueItem | null;
}): PlaybackNativeCommandPlan =>
  previousTrack
    ? { track: previousTrack, type: "play" }
    : { position: 0, type: "seek" };

export const getPlaybackNativeReplacementCommandPlan = ({
  isPlaying,
  replacementTrack,
}: {
  isPlaying: boolean;
  replacementTrack: PlaybackQueueItem | null;
}): PlaybackNativeCommandPlan =>
  replacementTrack && isPlaying
    ? { track: replacementTrack, type: "play" }
    : { type: "stop" };
