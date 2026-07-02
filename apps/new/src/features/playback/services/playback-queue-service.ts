import type {
  PlaybackQueueFilter,
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";

export const initialPlaybackQueueFilter: PlaybackQueueFilter = {
  order: "desc",
  query: "",
  sort: "recent",
};

export const findQueueIndex = ({
  queue,
  songId,
}: {
  queue: PlaybackQueueItem[];
  songId: number;
}) => queue.findIndex((item) => item.id === songId);

export const upsertQueueItem = ({
  queue,
  song,
}: {
  queue: PlaybackQueueItem[];
  song: PlaybackQueueItem;
}) => {
  const existingIndex = findQueueIndex({ queue, songId: song.id });

  if (existingIndex >= 0) {
    return queue.map((item, index) => (index === existingIndex ? song : item));
  }

  return [...queue, song];
};

export const moveQueueItem = ({
  fromIndex,
  queue,
  toIndex,
}: {
  fromIndex: number;
  queue: PlaybackQueueItem[];
  toIndex: number;
}) => {
  if (
    fromIndex < 0 ||
    fromIndex >= queue.length ||
    toIndex < 0 ||
    toIndex >= queue.length ||
    fromIndex === toIndex
  ) {
    return queue;
  }

  const nextQueue = [...queue];
  const [movedItem] = nextQueue.splice(fromIndex, 1);
  nextQueue.splice(toIndex, 0, movedItem);

  return nextQueue;
};

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

export const getPlaybackQueueRowState = ({
  activeTrackId,
  adBreakActive,
  index,
  queueLength,
  songId,
}: {
  activeTrackId: number | null;
  adBreakActive: boolean;
  index: number;
  queueLength: number;
  songId: number;
}) => ({
  canMoveDown: index < queueLength - 1,
  canMoveUp: index > 0,
  canPlay: !adBreakActive,
  isActive: activeTrackId === songId,
});

export const getPlaybackQueueActionState = ({
  queueLength,
}: {
  queueLength: number;
}) => ({
  canClearQueue: queueLength > 0,
});
