import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";

export type TrackPlayerAdapter = {
  pause: () => Promise<void>;
  play: (song: PlaybackQueueItem) => Promise<void>;
  restore: (state: PlaybackState) => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  stop: () => Promise<void>;
};

export const createUnavailableTrackPlayerAdapter = (): TrackPlayerAdapter => ({
  pause: () => Promise.resolve(),
  play: () => Promise.resolve(),
  restore: () => Promise.resolve(),
  seekTo: () => Promise.resolve(),
  stop: () => Promise.resolve(),
});
