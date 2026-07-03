import type { PlaybackQueueItem, PlaybackState } from "../types/playback-state";
import {
  findQueueIndex,
  getReplacementTrackAfterRemoval,
  moveQueueItem,
  upsertQueueItem,
} from "./playback-queue-service";
import { resetPlaybackAdGate } from "./playback-ad-gate-service";

export const bumpPlaybackQueueRevision = (state: PlaybackState) => ({
  ...state,
  queueRevision: state.queueRevision + 1,
});

export const addPlaybackQueueSong = ({
  song,
  state,
}: {
  song: PlaybackQueueItem;
  state: PlaybackState;
}) =>
  bumpPlaybackQueueRevision({
    ...state,
    queue: upsertQueueItem({ queue: state.queue, song }),
  });

export const clearPlaybackQueue = (state: PlaybackState) =>
  bumpPlaybackQueueRevision({
    ...state,
    activeQueueIndex: null,
    activeTrackId: null,
    adGate: resetPlaybackAdGate(state.adGate),
    duration: 0,
    isPlaying: false,
    position: 0,
    queue: [],
    source: null,
  });

export const removePlaybackQueueSong = ({
  songId,
  state,
}: {
  songId: number;
  state: PlaybackState;
}) => {
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

  return bumpPlaybackQueueRevision({
    ...state,
    activeQueueIndex: nextActiveTrack ? activeQueueIndex : null,
    activeTrackId: nextActiveTrack?.id ?? null,
    duration: nextActiveTrack?.duration ?? 0,
    isPlaying: nextActiveTrack ? state.isPlaying : false,
    position: state.activeTrackId === songId ? 0 : state.position,
    queue,
  });
};

export const movePlaybackQueueSong = ({
  direction,
  songId,
  state,
}: {
  direction: "down" | "up";
  songId: number;
  state: PlaybackState;
}) => {
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
  const normalizedActiveQueueIndex =
    activeQueueIndex !== null && activeQueueIndex >= 0 ? activeQueueIndex : null;

  return bumpPlaybackQueueRevision({
    ...state,
    activeQueueIndex: normalizedActiveQueueIndex,
    queue,
  });
};
