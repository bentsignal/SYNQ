import type { PlaybackQueueItem } from "../types/playback-state";
import type { PlaybackNativeCommandPlan } from "./playback-native-command-plan-service";

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
