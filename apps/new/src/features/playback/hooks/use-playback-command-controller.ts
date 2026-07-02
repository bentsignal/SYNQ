import { useCallback, useMemo, type RefObject } from "react";
import {
  handlePlaybackRemoteCommand,
  type PlaybackRemoteCommand,
  type PlaybackRemoteCommandResult,
} from "../services/playback-remote-command-service";
import {
  getRemoveFromQueueNativeCommandPlan,
  getResumeNativeCommandPlan,
  getSkipNextNativeCommandPlan,
  getSkipPreviousNativeCommandPlan,
  runPlaybackNativeCommandPlan,
  type PlaybackNativeCommandPlan,
} from "../services/playback-native-command-plan-service";
import { clearPersistedPlaybackState } from "../services/playback-persistence-service";
import type { PlaybackAction } from "../services/playback-session-service";
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
  const runNativeCommandPlan = useCallback(
    (plan: PlaybackNativeCommandPlan) => {
      runPlaybackNativeCommandPlan({ adapter, plan, runNativeCommand });
    },
    [adapter, runNativeCommand],
  );

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
    runNativeCommandPlan({ type: "pause" });
  }, [dispatch, runNativeCommandPlan]);

  const resume = useCallback(() => {
    runAdGatedCommand(() => {
      dispatch({ type: "resume" });
      runNativeCommandPlan(getResumeNativeCommandPlan(stateRef.current));
    });
  }, [dispatch, runAdGatedCommand, runNativeCommandPlan, stateRef]);

  const seekTo = useCallback(
    (position: number) => {
      runAdGatedCommand(() => {
        dispatch({ position, type: "seek-to" });
        runNativeCommandPlan({ position, type: "seek" });
      });
    },
    [dispatch, runAdGatedCommand, runNativeCommandPlan],
  );

  const skipNext = useCallback(() => {
    runAdGatedCommand(() => {
      const { command, targetIndex } = getSkipNextNativeCommandPlan(
        stateRef.current,
      );

      dispatch({ targetIndex, type: "skip-next" });
      runNativeCommandPlan(command);
    });
  }, [dispatch, runAdGatedCommand, runNativeCommandPlan, stateRef]);

  const skipPrevious = useCallback(() => {
    runAdGatedCommand(() => {
      dispatch({ type: "skip-previous" });
      runNativeCommandPlan(getSkipPreviousNativeCommandPlan(stateRef.current));
    });
  }, [dispatch, runAdGatedCommand, runNativeCommandPlan, stateRef]);

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
    const command = getRemoveFromQueueNativeCommandPlan({
      songId,
      state: currentState,
    });

    dispatch({ songId, type: "remove-from-queue" });
    runNativeCommandPlan(command);
  }, [dispatch, runNativeCommandPlan, stateRef]);

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
