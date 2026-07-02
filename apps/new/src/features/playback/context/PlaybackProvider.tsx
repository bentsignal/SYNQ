import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import {
  findQueueIndex,
  initialPlaybackState,
  upsertQueueItem,
} from "../services/playback-session-service";
import { createExpoAvTrackPlayerAdapter } from "../services/track-player-adapter";
import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";

type PlaybackAction =
  | { song: PlaybackQueueItem; type: "play-song" }
  | { type: "pause" }
  | { type: "resume" }
  | { position: number; type: "seek-to" }
  | { type: "skip-next" }
  | { type: "skip-previous" }
  | { song: PlaybackQueueItem; type: "add-to-queue" }
  | { songId: number; type: "remove-from-queue" }
  | { error: string; type: "native-failure" }
  | { type: "toggle-loop" }
  | { type: "toggle-shuffle" };

type PlaybackCommands = {
  addToQueue: (song: PlaybackQueueItem) => void;
  pause: () => void;
  playSong: (song: PlaybackQueueItem) => void;
  removeFromQueue: (songId: number) => void;
  resume: () => void;
  seekTo: (position: number) => void;
  skipNext: () => void;
  skipPrevious: () => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
};

type PlaybackSessionValue = PlaybackCommands & {
  activeTrack: PlaybackQueueItem | null;
  state: PlaybackState;
};

const PlaybackSessionContext = createContext<PlaybackSessionValue | null>(null);

const getActiveTrack = (state: PlaybackState) =>
  state.activeQueueIndex === null
    ? null
    : state.queue[state.activeQueueIndex] ?? null;

const getNextTrack = (state: PlaybackState) => {
  const nextIndex =
    state.activeQueueIndex === null ? 0 : state.activeQueueIndex + 1;

  return state.queue[nextIndex] ?? null;
};

const getPreviousTrack = (state: PlaybackState) => {
  if (state.position >= 3000) {
    return getActiveTrack(state);
  }

  const previousIndex =
    state.activeQueueIndex === null
      ? null
      : Math.max(0, state.activeQueueIndex - 1);

  return previousIndex === null ? null : state.queue[previousIndex] ?? null;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Playback command failed.";

const bumpQueueRevision = (state: PlaybackState) => ({
  ...state,
  queueRevision: state.queueRevision + 1,
});

const playbackReducer = (
  state: PlaybackState,
  action: PlaybackAction,
): PlaybackState => {
  switch (action.type) {
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
      const nextIndex =
        state.activeQueueIndex === null ? 0 : state.activeQueueIndex + 1;
      const nextTrack = state.queue[nextIndex] ?? null;

      if (!nextTrack) {
        return {
          ...state,
          isPlaying: false,
          position: state.duration,
        };
      }

      return {
        ...state,
        activeQueueIndex: nextIndex,
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
    case "remove-from-queue": {
      const queue = state.queue.filter((song) => song.id !== action.songId);
      const activeQueueIndex =
        state.activeTrackId === action.songId
          ? null
          : findQueueIndex({ queue, songId: state.activeTrackId ?? -1 });
      const nextActiveTrack =
        activeQueueIndex === null || activeQueueIndex < 0
          ? null
          : queue[activeQueueIndex] ?? null;

      return bumpQueueRevision({
        ...state,
        activeQueueIndex: nextActiveTrack ? activeQueueIndex : null,
        activeTrackId: nextActiveTrack?.id ?? null,
        duration: nextActiveTrack?.duration ?? state.duration,
        isPlaying: nextActiveTrack ? state.isPlaying : false,
        queue,
      });
    }
    case "native-failure":
      return {
        ...state,
        error: action.error,
        isPlaying: false,
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
  }
};

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(playbackReducer, initialPlaybackState);
  const stateRef = useRef(state);
  const adapterRef = useRef(createExpoAvTrackPlayerAdapter());
  const activeTrack = useMemo(() => getActiveTrack(state), [state]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(
    () => () => {
      void adapterRef.current.destroy();
    },
    [],
  );

  const runNativeCommand = useCallback((command: () => Promise<void>) => {
    void command().catch((error) => {
      dispatch({ error: getErrorMessage(error), type: "native-failure" });
    });
  }, []);

  const playSong = useCallback((song: PlaybackQueueItem) => {
    dispatch({ song, type: "play-song" });
    runNativeCommand(() => adapterRef.current.play(song));
  }, [runNativeCommand]);
  const pause = useCallback(() => {
    dispatch({ type: "pause" });
    runNativeCommand(() => adapterRef.current.pause());
  }, [runNativeCommand]);
  const resume = useCallback(() => {
    const activeSong = getActiveTrack(stateRef.current);

    dispatch({ type: "resume" });
    runNativeCommand(() =>
      activeSong ? adapterRef.current.resume() : Promise.resolve(),
    );
  }, [runNativeCommand]);
  const seekTo = useCallback((position: number) => {
    dispatch({ position, type: "seek-to" });
    runNativeCommand(() => adapterRef.current.seekTo(position));
  }, [runNativeCommand]);
  const skipNext = useCallback(() => {
    const nextTrack = getNextTrack(stateRef.current);

    dispatch({ type: "skip-next" });
    runNativeCommand(() =>
      nextTrack ? adapterRef.current.play(nextTrack) : adapterRef.current.stop(),
    );
  }, [runNativeCommand]);
  const skipPrevious = useCallback(() => {
    const previousTrack = getPreviousTrack(stateRef.current);

    dispatch({ type: "skip-previous" });
    runNativeCommand(() =>
      previousTrack
        ? adapterRef.current.play(previousTrack)
        : adapterRef.current.seekTo(0),
    );
  }, [runNativeCommand]);
  const addToQueue = useCallback((song: PlaybackQueueItem) => {
    dispatch({ song, type: "add-to-queue" });
  }, []);
  const removeFromQueue = useCallback((songId: number) => {
    const activeTrackId = stateRef.current.activeTrackId;

    dispatch({ songId, type: "remove-from-queue" });
    if (activeTrackId === songId) {
      runNativeCommand(() => adapterRef.current.stop());
    }
  }, [runNativeCommand]);
  const toggleLoop = useCallback(() => {
    dispatch({ type: "toggle-loop" });
  }, []);
  const toggleShuffle = useCallback(() => {
    dispatch({ type: "toggle-shuffle" });
  }, []);

  const value = useMemo<PlaybackSessionValue>(
    () => ({
      activeTrack,
      addToQueue,
      pause,
      playSong,
      removeFromQueue,
      resume,
      seekTo,
      skipNext,
      skipPrevious,
      state,
      toggleLoop,
      toggleShuffle,
    }),
    [
      activeTrack,
      addToQueue,
      pause,
      playSong,
      removeFromQueue,
      resume,
      seekTo,
      skipNext,
      skipPrevious,
      state,
      toggleLoop,
      toggleShuffle,
    ],
  );

  return (
    <PlaybackSessionContext.Provider value={value}>
      {children}
    </PlaybackSessionContext.Provider>
  );
}

export function usePlaybackSession() {
  const value = useContext(PlaybackSessionContext);

  if (!value) {
    throw new Error("usePlaybackSession must be used inside PlaybackProvider.");
  }

  return value;
}
