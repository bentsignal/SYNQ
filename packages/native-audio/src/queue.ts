import type { PlaybackQueue, PlaybackTrack } from "./domain";

export const findPlaybackTrackIndex = (
  queue: PlaybackQueue,
  trackId: string | null,
) =>
  trackId === null
    ? -1
    : queue.tracks.findIndex((track) => track.id === trackId);

export const getPlaybackQueueActiveTrack = (
  queue: PlaybackQueue,
): PlaybackTrack | null =>
  queue.activeTrackId === null
    ? null
    : (queue.tracks.find((track) => track.id === queue.activeTrackId) ?? null);

export const getNextPlaybackTrackId = (queue: PlaybackQueue): string | null => {
  if (queue.tracks.length === 0) {
    return null;
  }

  const activeIndex = findPlaybackTrackIndex(queue, queue.activeTrackId);
  const nextIndex = activeIndex < 0 ? 0 : activeIndex + 1;
  return queue.tracks[nextIndex]?.id ?? null;
};

export const getPreviousPlaybackTrackId = (
  queue: PlaybackQueue,
): string | null => {
  if (queue.tracks.length === 0) {
    return null;
  }

  const activeIndex = findPlaybackTrackIndex(queue, queue.activeTrackId);
  const previousIndex = activeIndex < 0 ? 0 : Math.max(0, activeIndex - 1);
  return queue.tracks[previousIndex]?.id ?? null;
};

export const setPlaybackQueueActiveTrack = (
  queue: PlaybackQueue,
  activeTrackId: string | null,
): PlaybackQueue => ({
  activeTrackId,
  tracks: queue.tracks,
});

