import type { PlaybackState } from "../types/playback-state";
import { initialPlaybackAdGateState } from "./playback-ad-gate-service";
import { initialPlaybackQueueFilter } from "./playback-queue-filter-service";

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
