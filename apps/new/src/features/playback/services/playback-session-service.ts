import type {
  PlaybackQueueFilter,
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";
import { initialPlaybackAdGateState } from "./playback-ad-gate-service";

export const initialPlaybackQueueFilter: PlaybackQueueFilter = {
  order: "desc",
  query: "",
  sort: "recent",
};

export const initialPlaybackState: PlaybackState = {
  activeQueueIndex: null,
  activeTrackId: null,
  addOffset: 0,
  adGate: initialPlaybackAdGateState,
  duration: 0,
  error: null,
  initialized: true,
  isPlaying: false,
  mode: {
    loop: false,
    shuffle: false,
  },
  position: 0,
  queue: [],
  queueFilter: initialPlaybackQueueFilter,
  queueRevision: 0,
  source: null,
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
