import { useCallback, useMemo, type RefObject } from "react";
import {
  handlePlaybackRemoteCommand,
  type PlaybackRemoteCommand,
  type PlaybackRemoteCommandResult,
} from "../services/playback-remote-command-service";
import { clearPersistedPlaybackState } from "../services/playback-persistence-service";
import {
  getActiveTrack,
  getNextQueueIndex,
  getPreviousTrack,
  getReplacementTrackAfterRemoval,
  type PlaybackAction,
} from "../services/playback-session-service";
import type { TrackPlayerAdapter } from "../services/track-player-adapter";
import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";

export type PlaybackCommands = {
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

type UsePlaybackCommandControllerParams = {
  adapter: TrackPlayerAdapter;
  beginAdBreak: () => void;
  canRunPlaybackCommand: () => boolean;
  dispatch: (action: PlaybackAction) => void;
  finishActiveTrack: () => void;
  runNativeCommand: (command: () => Promise<void>) => void;
  stateRef: RefObject<PlaybackState>;
};

export function usePlaybackCommandController({
  adapter,
  beginAdBreak,
  canRunPlaybackCommand,
  dispatch,
  finishActiveTrack,
  runNativeCommand,
  stateRef,
}: UsePlaybackCommandControllerParams): PlaybackCommands {
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
    runNativeCommand(() => adapter.stop());
  }, [adapter, dispatch, runNativeCommand]);

  const playSong = useCallback(
    (song: PlaybackQueueItem) => {
      runAdGatedCommand(() => {
        dispatch({ song, type: "play-song" });
        runNativeCommand(() => adapter.play(song));
      });
    },
    [adapter, dispatch, runAdGatedCommand, runNativeCommand],
  );

  const pause = useCallback(() => {
    dispatch({ type: "pause" });
    runNativeCommand(() => adapter.pause());
  }, [adapter, dispatch, runNativeCommand]);

  const resume = useCallback(() => {
    runAdGatedCommand(() => {
      const activeSong = getActiveTrack(stateRef.current);

      dispatch({ type: "resume" });
      runNativeCommand(() => (activeSong ? adapter.resume() : Promise.resolve()));
    });
  }, [adapter, dispatch, runAdGatedCommand, runNativeCommand, stateRef]);

  const seekTo = useCallback(
    (position: number) => {
      runAdGatedCommand(() => {
        dispatch({ position, type: "seek-to" });
        runNativeCommand(() => adapter.seekTo(position));
      });
    },
    [adapter, dispatch, runAdGatedCommand, runNativeCommand],
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
      runNativeCommand(() => (nextTrack ? adapter.play(nextTrack) : adapter.stop()));
    });
  }, [adapter, dispatch, runAdGatedCommand, runNativeCommand, stateRef]);

  const skipPrevious = useCallback(() => {
    runAdGatedCommand(() => {
      const previousTrack = getPreviousTrack(stateRef.current);

      dispatch({ type: "skip-previous" });
      runNativeCommand(() =>
        previousTrack ? adapter.play(previousTrack) : adapter.seekTo(0),
      );
    });
  }, [adapter, dispatch, runAdGatedCommand, runNativeCommand, stateRef]);

  const addToQueue = useCallback((song: PlaybackQueueItem) => {
    dispatch({ song, type: "add-to-queue" });
  }, [dispatch]);

  const clearQueue = useCallback(() => {
    dispatch({ type: "clear-queue" });
    runNativeCommand(() => adapter.stop());
  }, [adapter, dispatch, runNativeCommand]);

  const resetPlaybackSession = useCallback(() => {
    void clearPersistedPlaybackState();
    dispatch({ type: "reset" });
    runNativeCommand(() => adapter.stop());
  }, [adapter, dispatch, runNativeCommand]);

  const moveQueueSong = useCallback(
    (songId: number, direction: "down" | "up") => {
      dispatch({ direction, songId, type: "move-queue-song" });
    },
    [dispatch],
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
          ? adapter.play(replacementTrack)
          : adapter.stop(),
      );
    }
  }, [adapter, dispatch, runNativeCommand, stateRef]);

  const toggleLoop = useCallback(() => {
    dispatch({ type: "toggle-loop" });
  }, [dispatch]);

  const toggleShuffle = useCallback(() => {
    dispatch({ type: "toggle-shuffle" });
  }, [dispatch]);

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

  return useMemo(
    () => ({
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
      toggleLoop,
      toggleShuffle,
    }),
    [
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
      toggleLoop,
      toggleShuffle,
    ],
  );
}
