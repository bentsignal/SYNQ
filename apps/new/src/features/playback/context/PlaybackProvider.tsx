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
  moveQueueItem,
  upsertQueueItem,
} from "../services/playback-session-service";
import {
  loadPersistedPlaybackState,
  savePersistedPlaybackState,
} from "../services/playback-persistence-service";
import {
  createExpoAvTrackPlayerAdapter,
  type TrackPlayerStatusSnapshot,
} from "../services/track-player-adapter";
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
  | { type: "clear-queue" }
  | { songId: number; type: "remove-from-queue" }
  | { direction: "down" | "up"; songId: number; type: "move-queue-song" }
  | { state: PlaybackState; type: "hydrate" }
  | { error: string; type: "native-failure" }
  | { status: TrackPlayerStatusSnapshot; type: "native-status" }
  | { type: "native-finished" }
  | { type: "toggle-loop" }
  | { type: "toggle-shuffle" };

type PlaybackCommands = {
  addToQueue: (song: PlaybackQueueItem) => void;
  clearQueue: () => void;
  moveQueueSong: (songId: number, direction: "down" | "up") => void;
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

const getReplacementTrackAfterRemoval = ({
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
    case "hydrate":
      return {
        ...action.state,
        error: null,
        initialized: true,
      };
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
    case "clear-queue":
      return bumpQueueRevision({
        ...state,
        activeQueueIndex: null,
        activeTrackId: null,
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

      return {
        ...state,
        duration: action.status.duration ?? state.duration,
        isPlaying: action.status.isPlaying,
        position: Math.max(0, action.status.position),
      };
    case "native-finished": {
      const nextIndex =
        state.activeQueueIndex === null ? null : state.activeQueueIndex + 1;
      const nextTrack =
        nextIndex === null ? null : state.queue[nextIndex] ?? null;

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
  const hasHydratedRef = useRef(false);
  const lastPersistedAtRef = useRef(0);
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

  useEffect(() => {
    let isMounted = true;

    const hydratePlaybackState = async () => {
      const persistedState = await loadPersistedPlaybackState();
      if (!isMounted) {
        return;
      }

      hasHydratedRef.current = true;
      dispatch({ state: persistedState, type: "hydrate" });

      if (persistedState.isPlaying) {
        runNativeCommand(() => adapterRef.current.restore(persistedState));
      }
    };

    void hydratePlaybackState();

    return () => {
      isMounted = false;
    };
  }, [runNativeCommand]);

  useEffect(() => {
    if (!hasHydratedRef.current) {
      return;
    }

    const now = Date.now();
    const shouldPersistImmediately = !state.isPlaying;
    const shouldPersistProgress = now - lastPersistedAtRef.current > 5000;

    if (!shouldPersistImmediately && !shouldPersistProgress) {
      return;
    }

    lastPersistedAtRef.current = now;
    void savePersistedPlaybackState(state);
  }, [state]);

  useEffect(() => {
    const adapter = adapterRef.current;

    adapter.setStatusListener((status) => {
      if (status.didJustFinish) {
        const nextTrack = getNextTrack(stateRef.current);

        dispatch({ type: "native-finished" });
        if (nextTrack) {
          runNativeCommand(() => adapter.play(nextTrack));
        }
        return;
      }

      dispatch({ status, type: "native-status" });
    });

    return () => {
      adapter.setStatusListener(null);
    };
  }, [runNativeCommand]);

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
  const clearQueue = useCallback(() => {
    dispatch({ type: "clear-queue" });
    runNativeCommand(() => adapterRef.current.stop());
  }, [runNativeCommand]);
  const moveQueueSong = useCallback(
    (songId: number, direction: "down" | "up") => {
      dispatch({ direction, songId, type: "move-queue-song" });
    },
    [],
  );
  const removeFromQueue = useCallback((songId: number) => {
    const currentState = stateRef.current;
    const activeTrackId = currentState.activeTrackId;
    const replacementTrack = getReplacementTrackAfterRemoval({
      songId,
      state: currentState,
    });

    dispatch({ songId, type: "remove-from-queue" });
    if (activeTrackId === songId) {
      runNativeCommand(() =>
        replacementTrack && currentState.isPlaying
          ? adapterRef.current.play(replacementTrack)
          : adapterRef.current.stop(),
      );
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
      clearQueue,
      moveQueueSong,
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
      clearQueue,
      moveQueueSong,
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
