import type { PlaybackQueueItem, PlaybackState } from "../types/playback-state";
import {
  beginPlaybackAdBreak,
  completePlaybackAdBreak,
  initialPlaybackAdGateState,
  resetPlaybackAdGate,
  trackPlaybackAdProgress,
  updatePlaybackAdBreakProgress,
} from "./playback-ad-gate-service";
import type { TrackPlayerStatusSnapshot } from "./playback-native-status-service";
import {
  findQueueIndex,
  getReplacementTrackAfterRemoval,
  initialPlaybackQueueFilter,
  moveQueueItem,
  upsertQueueItem,
} from "./playback-queue-service";

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
