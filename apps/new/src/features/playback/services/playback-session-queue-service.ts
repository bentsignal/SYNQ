import type { PlaybackQueueItem, PlaybackState } from "../types/playback-state";
import {
  upsertQueueItem,
} from "./playback-queue-service";
import { resetPlaybackAdGate } from "./playback-ad-gate-service";
import {
  getPlaybackQueueMoveUpdate,
  getPlaybackQueueRemovalUpdate,
} from "./playback-session-queue-step-service";

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
  const update = getPlaybackQueueRemovalUpdate({ songId, state });

  return bumpPlaybackQueueRevision({
    ...state,
    ...update,
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
  const update = getPlaybackQueueMoveUpdate({ direction, songId, state });

  return bumpPlaybackQueueRevision({
    ...state,
    ...update,
  });
};
