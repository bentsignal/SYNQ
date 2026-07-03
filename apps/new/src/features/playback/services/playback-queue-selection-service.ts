import type { PlaybackQueueItem, PlaybackState } from "../types/playback-state";
import { findQueueIndex } from "./playback-queue-mutation-service";

export const getNextQueueIndex = ({
  activeQueueIndex,
  loop,
  queue,
  random = Math.random,
  shuffle,
}: {
  activeQueueIndex: number | null;
  loop: boolean;
  queue: PlaybackQueueItem[];
  random?: () => number;
  shuffle: boolean;
}) => {
  if (queue.length === 0) {
    return null;
  }

  if (shuffle) {
    const playableIndexes = queue
      .map((_, index) => index)
      .filter((index) => index !== activeQueueIndex);

    if (playableIndexes.length === 0) {
      return loop ? 0 : null;
    }

    const randomIndex = Math.floor(random() * playableIndexes.length);

    return playableIndexes[randomIndex] ?? null;
  }

  const nextIndex = activeQueueIndex === null ? 0 : activeQueueIndex + 1;

  if (queue[nextIndex]) {
    return nextIndex;
  }

  return loop ? 0 : null;
};

export const getActiveTrack = (state: PlaybackState) =>
  state.activeQueueIndex === null
    ? null
    : state.queue[state.activeQueueIndex] ?? null;

export const getPreviousTrack = (state: PlaybackState) => {
  if (state.position >= 3000) {
    return getActiveTrack(state);
  }

  const previousIndex =
    state.activeQueueIndex === null
      ? null
      : Math.max(0, state.activeQueueIndex - 1);

  return previousIndex === null ? null : state.queue[previousIndex] ?? null;
};

export const getReplacementTrackAfterRemoval = ({
  songId,
  state,
}: {
  songId: number;
  state: PlaybackState;
}) => {
  const removeIndex = findQueueIndex({ queue: state.queue, songId });

  if (removeIndex < 0) {
    return null;
  }

  const queue = state.queue.filter((song) => song.id !== songId);

  return queue[removeIndex] ?? queue[removeIndex - 1] ?? null;
};
