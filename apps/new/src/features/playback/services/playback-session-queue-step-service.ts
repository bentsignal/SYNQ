import type { PlaybackQueueItem, PlaybackState } from "../types/playback-state";
import {
  findQueueIndex,
  getReplacementTrackAfterRemoval,
  moveQueueItem,
} from "./playback-queue-service";

export const getPlaybackQueueRemovalUpdate = ({
  songId,
  state,
}: {
  songId: number;
  state: PlaybackState;
}): {
  activeQueueIndex: number | null;
  activeTrackId: number | null;
  duration: number;
  isPlaying: boolean;
  position: number;
  queue: PlaybackQueueItem[];
} => {
  const replacementTrack = state.isPlaying
    ? getReplacementTrackAfterRemoval({
        songId,
        state,
      })
    : null;
  const queue = state.queue.filter((song) => song.id !== songId);
  const activeQueueIndex =
    state.activeTrackId === songId
      ? replacementTrack
        ? findQueueIndex({ queue, songId: replacementTrack.id })
        : null
      : findQueueIndex({ queue, songId: state.activeTrackId ?? -1 });
  const nextActiveTrack =
    activeQueueIndex === null || activeQueueIndex < 0
      ? null
      : queue[activeQueueIndex] ?? null;

  return {
    activeQueueIndex: nextActiveTrack ? activeQueueIndex : null,
    activeTrackId: nextActiveTrack?.id ?? null,
    duration: nextActiveTrack?.duration ?? 0,
    isPlaying: nextActiveTrack ? state.isPlaying : false,
    position: state.activeTrackId === songId ? 0 : state.position,
    queue,
  };
};

export const getPlaybackQueueMoveUpdate = ({
  direction,
  songId,
  state,
}: {
  direction: "down" | "up";
  songId: number;
  state: PlaybackState;
}): {
  activeQueueIndex: number | null;
  queue: PlaybackQueueItem[];
} => {
  const fromIndex = findQueueIndex({
    queue: state.queue,
    songId,
  });
  const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
  const queue = moveQueueItem({
    fromIndex,
    queue: state.queue,
    toIndex,
  });
  const activeQueueIndex =
    state.activeTrackId === null
      ? null
      : findQueueIndex({ queue, songId: state.activeTrackId });

  return {
    activeQueueIndex:
      activeQueueIndex !== null && activeQueueIndex >= 0
        ? activeQueueIndex
        : null,
    queue,
  };
};
