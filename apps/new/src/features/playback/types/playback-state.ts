export type PlaybackSource =
  | { type: "library" }
  | { id: number; type: "album" | "artist" | "playlist" };

export type PlaybackQueueSort = "album" | "artist" | "recent" | "title";

export type PlaybackQueueOrder = "asc" | "desc";

export type PlaybackQueueFilter = {
  order: PlaybackQueueOrder;
  query: string;
  sort: PlaybackQueueSort;
};

export type PlaybackQueueItem = {
  album: string;
  artist: string;
  duration: number | null;
  id: number;
  pathToFile: string | null;
  title: string;
};

export type PlaybackMode = {
  loop: boolean;
  shuffle: boolean;
};

export type PlaybackAdGateState = {
  accumulatedMs: number;
  active: boolean;
  due: boolean;
  lastTrackedPosition: number | null;
  thresholdMs: number;
};

export type PlaybackState = {
  activeQueueIndex: number | null;
  activeTrackId: number | null;
  addOffset: number;
  adGate: PlaybackAdGateState;
  duration: number;
  error: string | null;
  initialized: boolean;
  isPlaying: boolean;
  mode: PlaybackMode;
  position: number;
  queue: PlaybackQueueItem[];
  queueFilter: PlaybackQueueFilter;
  queueRevision: number;
  source: PlaybackSource | null;
};
