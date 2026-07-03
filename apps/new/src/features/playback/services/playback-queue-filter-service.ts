import type { PlaybackQueueFilter } from "../types/playback-state";

export const initialPlaybackQueueFilter: PlaybackQueueFilter = {
  order: "desc",
  query: "",
  sort: "recent",
};
