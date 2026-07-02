import { useCallback, useMemo, type RefObject } from "react";
import {
  handlePlaybackRemoteCommand,
  type PlaybackRemoteCommand,
  type PlaybackRemoteCommandResult,
} from "../services/playback-remote-command-service";
import { runAdGatedPlaybackCommand } from "../services/playback-command-gate-service";
import {
  getClearQueuePlaybackCommandPlan,
  getPausePlaybackCommandPlan,
  getPlaySongPlaybackCommandPlan,
  getRemoveFromQueuePlaybackCommandPlan,
  getRemoteFailurePlaybackCommandPlan,
  getResetPlaybackCommandPlan,
  getResumePlaybackCommandPlan,
  getSeekToPlaybackCommandPlan,
  getSkipNextPlaybackCommandPlan,
  getSkipPreviousPlaybackCommandPlan,
} from "../services/playback-command-plan-service";
import {
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
      runAdGatedPlaybackCommand({
        beginAdBreak,
        canRunPlaybackCommand,
        command,
      });
    },
    [beginAdBreak, canRunPlaybackCommand],
  );

  const failFromRemoteCommand = useCallback((message: string) => {
    const { action, nativeCommand } =
      getRemoteFailurePlaybackCommandPlan(message);

    dispatch(action);
    runNativeCommandPlan(nativeCommand);
  }, [dispatch, runNativeCommandPlan]);

  const playSong = useCallback(
    (song: PlaybackQueueItem) => {
      runAdGatedCommand(() => {
        const { action, nativeCommand } = getPlaySongPlaybackCommandPlan(song);

        dispatch(action);
        runNativeCommandPlan(nativeCommand);
      });
    },
    [dispatch, runAdGatedCommand, runNativeCommandPlan],
  );

  const pause = useCallback(() => {
    const { action, nativeCommand } = getPausePlaybackCommandPlan();

    dispatch(action);
    runNativeCommandPlan(nativeCommand);
  }, [dispatch, runNativeCommandPlan]);

  const resume = useCallback(() => {
    runAdGatedCommand(() => {
      const { action, nativeCommand } = getResumePlaybackCommandPlan(
        stateRef.current,
      );

      dispatch(action);
      runNativeCommandPlan(nativeCommand);
    });
  }, [dispatch, runAdGatedCommand, runNativeCommandPlan, stateRef]);

  const seekTo = useCallback(
    (position: number) => {
      runAdGatedCommand(() => {
        const { action, nativeCommand } =
          getSeekToPlaybackCommandPlan(position);

        dispatch(action);
        runNativeCommandPlan(nativeCommand);
      });
    },
    [dispatch, runAdGatedCommand, runNativeCommandPlan],
  );

  const skipNext = useCallback(() => {
    runAdGatedCommand(() => {
      const { action, nativeCommand } = getSkipNextPlaybackCommandPlan(
        stateRef.current,
      );

      dispatch(action);
      runNativeCommandPlan(nativeCommand);
    });
  }, [dispatch, runAdGatedCommand, runNativeCommandPlan, stateRef]);

  const skipPrevious = useCallback(() => {
    runAdGatedCommand(() => {
      const { action, nativeCommand } = getSkipPreviousPlaybackCommandPlan(
        stateRef.current,
      );

      dispatch(action);
      runNativeCommandPlan(nativeCommand);
    });
  }, [dispatch, runAdGatedCommand, runNativeCommandPlan, stateRef]);

  const addToQueue = useCallback((song: PlaybackQueueItem) => {
    dispatch({ song, type: "add-to-queue" });
  }, [dispatch]);

  const clearQueue = useCallback(() => {
    const { action, nativeCommand } = getClearQueuePlaybackCommandPlan();

    dispatch(action);
    runNativeCommandPlan(nativeCommand);
  }, [dispatch, runNativeCommandPlan]);

  const resetPlaybackSession = useCallback(() => {
    const { action, nativeCommand } = getResetPlaybackCommandPlan();

    void clearPersistedPlaybackState();
    dispatch(action);
    runNativeCommandPlan(nativeCommand);
  }, [dispatch, runNativeCommandPlan]);

  const moveQueueSong = useCallback(
    (songId: number, direction: "down" | "up") => {
      dispatch({ direction, songId, type: "move-queue-song" });
    },
    [dispatch],
  );

  const removeFromQueue = useCallback((songId: number) => {
    const { action, nativeCommand } = getRemoveFromQueuePlaybackCommandPlan({
      songId,
      state: stateRef.current,
    });

    dispatch(action);
    runNativeCommandPlan(nativeCommand);
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
