import type { PlaybackQueueItem, PlaybackState } from "../types/playback-state";
import { findQueueIndex, upsertQueueItem } from "./playback-queue-service";
import { setPlaybackActiveQueueIndex } from "./playback-active-track-service";

export const playPlaybackSong = ({
  song,
  state,
}: {
  song: PlaybackQueueItem;
  state: PlaybackState;
}): PlaybackState => {
  const queue = upsertQueueItem({ queue: state.queue, song });
  const activeQueueIndex = findQueueIndex({
    queue,
    songId: song.id,
  });

  return {
    ...state,
    activeQueueIndex,
    activeTrackId: song.id,
    duration: song.duration ?? 0,
    error: null,
    isPlaying: true,
    position: 0,
    queue,
    source: { type: "library" },
  };
};

export const pausePlayback = (state: PlaybackState): PlaybackState => ({
  ...state,
  isPlaying: false,
});

export const resumePlayback = (state: PlaybackState): PlaybackState => ({
  ...state,
  isPlaying: state.activeTrackId !== null,
});

export const seekPlayback = ({
  position,
  state,
}: {
  position: number;
  state: PlaybackState;
}): PlaybackState => ({
  ...state,
  position: Math.max(0, Math.min(position, state.duration)),
});

export const skipToNextPlaybackTrack = ({
  state,
  targetIndex,
}: {
  state: PlaybackState;
  targetIndex: number | null;
}) => setPlaybackActiveQueueIndex({ index: targetIndex, state });

export const skipToPreviousPlaybackTrack = (
  state: PlaybackState,
): PlaybackState => {
  if (state.position >= 3000) {
    return {
      ...state,
      position: 0,
    };
  }

  const previousIndex =
    state.activeQueueIndex === null
      ? null
      : Math.max(0, state.activeQueueIndex - 1);

  if (previousIndex === null || !state.queue[previousIndex]) {
    return {
      ...state,
      position: 0,
    };
  }

  return setPlaybackActiveQueueIndex({ index: previousIndex, state });
};
