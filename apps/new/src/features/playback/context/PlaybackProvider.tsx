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
import { usePremiumEntitlement } from "@/src/features/premium/context/PremiumEntitlementProvider";
import {
  beginPlaybackAdBreak,
  completePlaybackAdBreak,
  resetPlaybackAdGate,
  trackPlaybackAdProgress,
  updatePlaybackAdBreakProgress,
} from "../services/playback-ad-gate-service";
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
  handlePlaybackRemoteCommand,
  type PlaybackRemoteCommand,
  type PlaybackRemoteCommandResult,
} from "../services/playback-remote-command-service";
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
  | { type: "begin-ad-break" }
  | { type: "complete-ad-break" }
  | { state: PlaybackState; type: "hydrate" }
  | { error: string; type: "native-failure" }
  | { error: string; type: "remote-failure" }
  | {
      premiumActive: boolean;
      status: TrackPlayerStatusSnapshot;
      type: "native-status";
    }
  | { type: "native-finished" }
  | { premiumActive: boolean; type: "sync-premium" }
  | { type: "toggle-loop" }
  | { type: "toggle-shuffle" };

type PlaybackCommands = {
  addToQueue: (song: PlaybackQueueItem) => void;
  clearQueue: () => void;
  handleRemoteCommand: (
    command: PlaybackRemoteCommand,
  ) => PlaybackRemoteCommandResult;
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
      const nextIndex =
        state.activeQueueIndex === null ? null : state.activeQueueIndex + 1;
      const loopIndex =
        state.mode.loop && state.queue.length > 0 ? 0 : null;
      const targetIndex =
        nextIndex !== null && state.queue[nextIndex] ? nextIndex : loopIndex;
      const nextTrack =
        targetIndex === null ? null : state.queue[targetIndex] ?? null;

      if (!nextTrack) {
        return {
          ...state,
          isPlaying: false,
          position: state.duration,
        };
      }

      return {
        ...state,
        activeQueueIndex: targetIndex,
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

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const { state: premiumState } = usePremiumEntitlement();
  const [state, dispatch] = useReducer(playbackReducer, initialPlaybackState);
  const stateRef = useRef(state);
  const premiumActiveRef = useRef(premiumState.active);
  const adapterRef = useRef(createExpoAvTrackPlayerAdapter());
  const hasHydratedRef = useRef(false);
  const lastPersistedAtRef = useRef(0);
  const activeTrack = useMemo(() => getActiveTrack(state), [state]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    premiumActiveRef.current = premiumState.active;
    dispatch({ premiumActive: premiumState.active, type: "sync-premium" });
  }, [premiumState.active]);

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

  const canRunPlaybackCommand = useCallback(() => {
    const adGate = stateRef.current.adGate;

    return premiumActiveRef.current || (!adGate.active && !adGate.due);
  }, []);

  const beginAdBreak = useCallback(() => {
    dispatch({ type: "begin-ad-break" });
    runNativeCommand(() => adapterRef.current.playAd());
  }, [runNativeCommand]);

  useEffect(() => {
    if (state.adGate.due && !state.adGate.active && !premiumState.active) {
      beginAdBreak();
    }
  }, [
    beginAdBreak,
    premiumState.active,
    state.adGate.active,
    state.adGate.due,
  ]);

  useEffect(() => {
    if (premiumState.active && state.adGate.active && activeTrack) {
      runNativeCommand(() => adapterRef.current.resumeLibrary());
    }
  }, [activeTrack, premiumState.active, runNativeCommand, state.adGate.active]);

  const runAdGatedCommand = useCallback(
    (command: () => void) => {
      if (canRunPlaybackCommand()) {
        command();
        return;
      }

      beginAdBreak();
    },
    [beginAdBreak, canRunPlaybackCommand],
  );

  const failFromRemoteCommand = useCallback((message: string) => {
    dispatch({ error: message, type: "remote-failure" });
    runNativeCommand(() => adapterRef.current.stop());
  }, [runNativeCommand]);

  const finishActiveTrack = useCallback(() => {
    if (!canRunPlaybackCommand()) {
      beginAdBreak();
      return;
    }

    const nextTrack = getNextTrack(stateRef.current);
    const loopTrack = stateRef.current.mode.loop
      ? stateRef.current.queue[0] ?? null
      : null;
    const targetTrack = nextTrack ?? loopTrack;

    dispatch({ type: "native-finished" });
    if (targetTrack) {
      runNativeCommand(() => adapterRef.current.play(targetTrack));
    }
  }, [beginAdBreak, canRunPlaybackCommand, runNativeCommand]);

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
        if (status.source === "ad") {
          dispatch({ type: "complete-ad-break" });
          runNativeCommand(() => adapter.resumeLibrary());
          return;
        }

        finishActiveTrack();
        return;
      }

      dispatch({
        premiumActive: premiumActiveRef.current,
        status,
        type: "native-status",
      });
    });

    return () => {
      adapter.setStatusListener(null);
    };
  }, [finishActiveTrack, runNativeCommand]);

  const playSong = useCallback(
    (song: PlaybackQueueItem) => {
      runAdGatedCommand(() => {
        dispatch({ song, type: "play-song" });
        runNativeCommand(() => adapterRef.current.play(song));
      });
    },
    [runAdGatedCommand, runNativeCommand],
  );
  const pause = useCallback(() => {
    dispatch({ type: "pause" });
    runNativeCommand(() => adapterRef.current.pause());
  }, [runNativeCommand]);
  const resume = useCallback(() => {
    runAdGatedCommand(() => {
      const activeSong = getActiveTrack(stateRef.current);

      dispatch({ type: "resume" });
      runNativeCommand(() =>
        activeSong ? adapterRef.current.resume() : Promise.resolve(),
      );
    });
  }, [runAdGatedCommand, runNativeCommand]);
  const seekTo = useCallback(
    (position: number) => {
      runAdGatedCommand(() => {
        dispatch({ position, type: "seek-to" });
        runNativeCommand(() => adapterRef.current.seekTo(position));
      });
    },
    [runAdGatedCommand, runNativeCommand],
  );
  const skipNext = useCallback(() => {
    runAdGatedCommand(() => {
      const nextTrack = getNextTrack(stateRef.current);

      dispatch({ type: "skip-next" });
      runNativeCommand(() =>
        nextTrack
          ? adapterRef.current.play(nextTrack)
          : adapterRef.current.stop(),
      );
    });
  }, [runAdGatedCommand, runNativeCommand]);
  const skipPrevious = useCallback(() => {
    runAdGatedCommand(() => {
      const previousTrack = getPreviousTrack(stateRef.current);

      dispatch({ type: "skip-previous" });
      runNativeCommand(() =>
        previousTrack
          ? adapterRef.current.play(previousTrack)
          : adapterRef.current.seekTo(0),
      );
    });
  }, [runAdGatedCommand, runNativeCommand]);
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
  const handleRemoteCommand = useCallback(
    (command: PlaybackRemoteCommand) =>
      handlePlaybackRemoteCommand({
        command,
        handlers: {
          beginAdBreak,
          canRunPlaybackCommand,
          fail: failFromRemoteCommand,
          pause,
          queueEnded: finishActiveTrack,
          resume,
          seekTo,
          skipNext,
          skipPrevious,
        },
      }),
    [
      beginAdBreak,
      canRunPlaybackCommand,
      failFromRemoteCommand,
      finishActiveTrack,
      pause,
      resume,
      seekTo,
      skipNext,
      skipPrevious,
    ],
  );

  const value = useMemo<PlaybackSessionValue>(
    () => ({
      activeTrack,
      addToQueue,
      clearQueue,
      handleRemoteCommand,
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
      handleRemoteCommand,
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
