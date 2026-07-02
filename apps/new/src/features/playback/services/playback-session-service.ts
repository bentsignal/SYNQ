import type {
  PlaybackQueueFilter,
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";
import {
  beginPlaybackAdBreak,
  completePlaybackAdBreak,
  initialPlaybackAdGateState,
  resetPlaybackAdGate,
  trackPlaybackAdProgress,
  updatePlaybackAdBreakProgress,
} from "./playback-ad-gate-service";
import type { TrackPlayerStatusSnapshot } from "./track-player-adapter";

export type PlaybackAction =
  | { song: PlaybackQueueItem; type: "play-song" }
  | { type: "pause" }
  | { type: "resume" }
  | { position: number; type: "seek-to" }
  | { targetIndex: number | null; type: "skip-next" }
  | { type: "skip-previous" }
  | { song: PlaybackQueueItem; type: "add-to-queue" }
  | { type: "clear-queue" }
  | { songId: number; type: "remove-from-queue" }
  | { direction: "down" | "up"; songId: number; type: "move-queue-song" }
  | { type: "begin-ad-break" }
  | { type: "complete-ad-break" }
  | { state: PlaybackState; type: "hydrate" }
  | { type: "reset" }
  | { error: string; type: "native-failure" }
  | { error: string; type: "remote-failure" }
  | {
      premiumActive: boolean;
      status: TrackPlayerStatusSnapshot;
      type: "native-status";
    }
  | { targetIndex: number | null; type: "native-finished" }
  | { premiumActive: boolean; type: "sync-premium" }
  | { type: "toggle-loop" }
  | { type: "toggle-shuffle" };

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

const bumpQueueRevision = (state: PlaybackState) => ({
  ...state,
  queueRevision: state.queueRevision + 1,
});

export const playbackReducer = (
  state: PlaybackState,
  action: PlaybackAction,
): PlaybackState => {
  switch (action.type) {
    case "hydrate":
      return {
        ...action.state,
        error: null,
        initialized: true,
      };
    case "reset":
      return initialPlaybackState;
    case "play-song": {
      const queue = upsertQueueItem({ queue: state.queue, song: action.song });
      const activeQueueIndex = findQueueIndex({
        queue,
        songId: action.song.id,
      });

      return bumpQueueRevision({
        ...state,
        activeQueueIndex,
        activeTrackId: action.song.id,
        duration: action.song.duration ?? 0,
        error: null,
        isPlaying: true,
        position: 0,
        queue,
        source: { type: "library" },
      });
    }
    case "pause":
      return {
        ...state,
        isPlaying: false,
      };
    case "resume":
      return {
        ...state,
        isPlaying: state.activeTrackId !== null,
      };
    case "seek-to":
      return {
        ...state,
        position: Math.max(0, Math.min(action.position, state.duration)),
      };
    case "skip-next": {
      const nextTrack =
        action.targetIndex === null
          ? null
          : state.queue[action.targetIndex] ?? null;

      if (!nextTrack) {
        return {
          ...state,
          isPlaying: false,
          position: state.duration,
        };
      }

      return {
        ...state,
        activeQueueIndex: action.targetIndex,
        activeTrackId: nextTrack.id,
        duration: nextTrack.duration ?? 0,
        isPlaying: true,
        position: 0,
      };
    }
    case "skip-previous": {
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
      const previousTrack =
        previousIndex === null ? null : state.queue[previousIndex] ?? null;

      if (!previousTrack) {
        return {
          ...state,
          position: 0,
        };
      }

      return {
        ...state,
        activeQueueIndex: previousIndex,
        activeTrackId: previousTrack.id,
        duration: previousTrack.duration ?? 0,
        isPlaying: true,
        position: 0,
      };
    }
    case "add-to-queue":
      return bumpQueueRevision({
        ...state,
        queue: upsertQueueItem({ queue: state.queue, song: action.song }),
      });
    case "clear-queue":
      return bumpQueueRevision({
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
    case "remove-from-queue": {
      const replacementTrack = state.isPlaying
        ? getReplacementTrackAfterRemoval({
            songId: action.songId,
            state,
          })
        : null;
      const queue = state.queue.filter((song) => song.id !== action.songId);
      const activeQueueIndex =
        state.activeTrackId === action.songId
          ? replacementTrack
            ? findQueueIndex({ queue, songId: replacementTrack.id })
            : null
          : findQueueIndex({ queue, songId: state.activeTrackId ?? -1 });
      const nextActiveTrack =
        activeQueueIndex === null || activeQueueIndex < 0
          ? null
          : queue[activeQueueIndex] ?? null;

      return bumpQueueRevision({
        ...state,
        activeQueueIndex: nextActiveTrack ? activeQueueIndex : null,
        activeTrackId: nextActiveTrack?.id ?? null,
        duration: nextActiveTrack?.duration ?? 0,
        isPlaying: nextActiveTrack ? state.isPlaying : false,
        position: state.activeTrackId === action.songId ? 0 : state.position,
        queue,
      });
    }
    case "move-queue-song": {
      const fromIndex = findQueueIndex({
        queue: state.queue,
        songId: action.songId,
      });
      const toIndex =
        action.direction === "up" ? fromIndex - 1 : fromIndex + 1;
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
        activeQueueIndex !== null && activeQueueIndex >= 0
          ? activeQueueIndex
          : null;

      return bumpQueueRevision({
        ...state,
        activeQueueIndex: normalizedActiveQueueIndex,
        queue,
      });
    }
    case "begin-ad-break":
      return {
        ...state,
        adGate: beginPlaybackAdBreak(state.adGate),
        isPlaying: false,
      };
    case "complete-ad-break":
      return {
        ...state,
        adGate: completePlaybackAdBreak(state.adGate),
        error: null,
        isPlaying: state.activeTrackId !== null,
      };
    case "native-failure":
      return {
        ...state,
        error: action.error,
        isPlaying: false,
      };
    case "native-status":
      if (!action.status.isLoaded) {
        return state;
      }

      if (action.status.source === "ad") {
        return {
          ...state,
          adGate: updatePlaybackAdBreakProgress({
            duration: action.status.duration,
            position: action.status.position,
            state: state.adGate,
          }),
          isPlaying: false,
        };
      }

      return {
        ...state,
        adGate: action.status.isPlaying
          ? trackPlaybackAdProgress({
              currentPosition: action.status.position,
              gate: state.adGate,
              premiumActive: action.premiumActive,
            })
          : state.adGate,
        duration: action.status.duration ?? state.duration,
        isPlaying: action.status.isPlaying,
        position: Math.max(0, action.status.position),
      };
    case "native-finished": {
      const nextTrack =
        action.targetIndex === null
          ? null
          : state.queue[action.targetIndex] ?? null;

      if (!nextTrack) {
        return {
          ...state,
          isPlaying: false,
          position: state.duration,
        };
      }

      return {
        ...state,
        activeQueueIndex: action.targetIndex,
        activeTrackId: nextTrack.id,
        duration: nextTrack.duration ?? 0,
        isPlaying: true,
        position: 0,
      };
    }
    case "sync-premium":
      return {
        ...state,
        adGate: action.premiumActive
          ? resetPlaybackAdGate(state.adGate)
          : state.adGate,
        isPlaying:
          action.premiumActive && state.adGate.active
            ? state.activeTrackId !== null
            : state.isPlaying,
      };
    case "toggle-loop":
      return {
        ...state,
        mode: {
          ...state.mode,
          loop: !state.mode.loop,
        },
      };
    case "toggle-shuffle":
      return {
        ...state,
        mode: {
          ...state.mode,
          shuffle: !state.mode.shuffle,
        },
      };
    case "remote-failure":
      return {
        ...state,
        error: action.error,
        isPlaying: false,
      };
  }
};
