import type {
  PlaybackMode,
  PlaybackQueueItem,
} from "../types/playback-state";

export type PlaybackNativeCommandPlan =
  | { type: "noop" }
  | { type: "pause" }
  | {
      activeTrackId?: number | null;
      mode?: PlaybackMode;
      queue?: PlaybackQueueItem[];
      track: PlaybackQueueItem;
      type: "play";
    }
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
  mode,
  queue,
  targetIndex,
}: {
  mode?: PlaybackMode;
  queue: PlaybackQueueItem[];
  targetIndex: number | null;
}): {
  command: PlaybackNativeCommandPlan;
  targetIndex: number | null;
} => {
  const nextTrack = targetIndex === null ? null : queue[targetIndex] ?? null;

  return {
    command: nextTrack
      ? {
          activeTrackId: nextTrack.id,
          mode,
          queue,
          track: nextTrack,
          type: "play",
        }
      : { type: "stop" },
    targetIndex,
  };
};

export const getPlaybackNativePreviousCommandPlan = ({
  mode,
  previousTrack,
  queue,
}: {
  mode?: PlaybackMode;
  previousTrack: PlaybackQueueItem | null;
  queue?: PlaybackQueueItem[];
}): PlaybackNativeCommandPlan =>
  previousTrack
    ? {
        activeTrackId: previousTrack.id,
        mode,
        queue,
        track: previousTrack,
        type: "play",
      }
    : { position: 0, type: "seek" };

export const getPlaybackNativeReplacementCommandPlan = ({
  isPlaying,
  mode,
  queue,
  replacementTrack,
}: {
  isPlaying: boolean;
  mode?: PlaybackMode;
  queue?: PlaybackQueueItem[];
  replacementTrack: PlaybackQueueItem | null;
}): PlaybackNativeCommandPlan =>
  replacementTrack && isPlaying
    ? {
        activeTrackId: replacementTrack.id,
        mode,
        queue,
        track: replacementTrack,
        type: "play",
      }
    : { type: "stop" };
