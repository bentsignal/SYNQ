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
import { usePlaybackAdGateController } from "../hooks/use-playback-ad-gate-controller";
import {
  getActiveTrack,
  getNextQueueIndex,
  getPreviousTrack,
  getReplacementTrackAfterRemoval,
  initialPlaybackState,
  playbackReducer,
} from "../services/playback-session-service";
import {
  clearPersistedPlaybackState,
} from "../services/playback-persistence-service";
import { usePersistedPlaybackSession } from "../hooks/use-persisted-playback-session";
import {
  handlePlaybackRemoteCommand,
  type PlaybackRemoteCommand,
  type PlaybackRemoteCommandResult,
} from "../services/playback-remote-command-service";
import { createExpoAudioTrackPlayerAdapter } from "../services/track-player-adapter";
import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";

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
  resetPlaybackSession: () => void;
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

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Playback command failed.";

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const { state: premiumState } = usePremiumEntitlement();
  const [state, dispatch] = useReducer(playbackReducer, initialPlaybackState);
  const stateRef = useRef(state);
  const adapterRef = useRef(createExpoAudioTrackPlayerAdapter());
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

  const restorePersistedPlaybackState = useCallback(
    (persistedState: PlaybackState) => {
      runNativeCommand(() => adapterRef.current.restore(persistedState));
    },
    [runNativeCommand],
  );

  usePersistedPlaybackSession({
    dispatch,
    onRestorePlayingState: restorePersistedPlaybackState,
    state,
  });

  const playNativeAdBreak = useCallback(() => {
    runNativeCommand(() => adapterRef.current.playAd());
  }, [runNativeCommand]);
  const resumeNativeLibraryAfterPremium = useCallback(() => {
    runNativeCommand(() => adapterRef.current.resumeLibrary());
  }, [runNativeCommand]);
  const {
    beginAdBreak,
    canRunPlaybackCommand,
    premiumActiveRef,
  } = usePlaybackAdGateController({
    activeTrack,
    dispatch,
    onBeginAdBreak: playNativeAdBreak,
    onResumeLibraryAfterPremium: resumeNativeLibraryAfterPremium,
    premiumActive: premiumState.active,
    state,
    stateRef,
  });

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

    const targetIndex = getNextQueueIndex({
      activeQueueIndex: stateRef.current.activeQueueIndex,
      loop: stateRef.current.mode.loop,
      queue: stateRef.current.queue,
      shuffle: stateRef.current.mode.shuffle,
    });
    const targetTrack =
      targetIndex === null ? null : stateRef.current.queue[targetIndex] ?? null;

    dispatch({ targetIndex, type: "native-finished" });
    if (targetTrack) {
      runNativeCommand(() => adapterRef.current.play(targetTrack));
    }
  }, [beginAdBreak, canRunPlaybackCommand, runNativeCommand]);

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
  }, [finishActiveTrack, premiumActiveRef, runNativeCommand]);

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
      const targetIndex = getNextQueueIndex({
        activeQueueIndex: stateRef.current.activeQueueIndex,
        loop: stateRef.current.mode.loop,
        queue: stateRef.current.queue,
        shuffle: stateRef.current.mode.shuffle,
      });
      const nextTrack =
        targetIndex === null ? null : stateRef.current.queue[targetIndex] ?? null;

      dispatch({ targetIndex, type: "skip-next" });
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
  const resetPlaybackSession = useCallback(() => {
    void clearPersistedPlaybackState();
    dispatch({ type: "reset" });
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
      resetPlaybackSession,
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
      resetPlaybackSession,
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
