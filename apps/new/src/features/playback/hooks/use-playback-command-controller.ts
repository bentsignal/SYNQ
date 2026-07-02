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
  runPlaybackCommandPlan,
  type PlaybackCommandPlan,
} from "../services/playback-command-plan-service";
import type { PlaybackNativeCommandPlan } from "../services/playback-native-command-plan-service";
import { clearPersistedPlaybackState } from "../services/playback-persistence-service";
import type { PlaybackAction } from "../services/playback-session-service";
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
  beginAdBreak: () => void;
  canRunPlaybackCommand: () => boolean;
  dispatch: (action: PlaybackAction) => void;
  finishActiveTrack: () => void;
  runNativeCommandPlan: (plan: PlaybackNativeCommandPlan) => void;
  stateRef: RefObject<PlaybackState>;
};

export function usePlaybackCommandController({
  beginAdBreak,
  canRunPlaybackCommand,
  dispatch,
  finishActiveTrack,
  runNativeCommandPlan,
  stateRef,
}: UsePlaybackCommandControllerParams): PlaybackCommands {
  const runCommandPlan = useCallback(
    (plan: PlaybackCommandPlan) => {
      runPlaybackCommandPlan({ dispatch, plan, runNativeCommandPlan });
    },
    [dispatch, runNativeCommandPlan],
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
    runCommandPlan(getRemoteFailurePlaybackCommandPlan(message));
  }, [runCommandPlan]);

  const playSong = useCallback(
    (song: PlaybackQueueItem) => {
      runAdGatedCommand(() => {
        runCommandPlan(getPlaySongPlaybackCommandPlan(song));
      });
    },
    [runAdGatedCommand, runCommandPlan],
  );

  const pause = useCallback(() => {
    runCommandPlan(getPausePlaybackCommandPlan());
  }, [runCommandPlan]);

  const resume = useCallback(() => {
    runAdGatedCommand(() => {
      runCommandPlan(getResumePlaybackCommandPlan(stateRef.current));
    });
  }, [runAdGatedCommand, runCommandPlan, stateRef]);

  const seekTo = useCallback(
    (position: number) => {
      runAdGatedCommand(() => {
        runCommandPlan(getSeekToPlaybackCommandPlan(position));
      });
    },
    [runAdGatedCommand, runCommandPlan],
  );

  const skipNext = useCallback(() => {
    runAdGatedCommand(() => {
      runCommandPlan(getSkipNextPlaybackCommandPlan(stateRef.current));
    });
  }, [runAdGatedCommand, runCommandPlan, stateRef]);

  const skipPrevious = useCallback(() => {
    runAdGatedCommand(() => {
      runCommandPlan(getSkipPreviousPlaybackCommandPlan(stateRef.current));
    });
  }, [runAdGatedCommand, runCommandPlan, stateRef]);

  const addToQueue = useCallback((song: PlaybackQueueItem) => {
    dispatch({ song, type: "add-to-queue" });
  }, [dispatch]);

  const clearQueue = useCallback(() => {
    runCommandPlan(getClearQueuePlaybackCommandPlan());
  }, [runCommandPlan]);

  const resetPlaybackSession = useCallback(() => {
    void clearPersistedPlaybackState();
    runCommandPlan(getResetPlaybackCommandPlan());
  }, [runCommandPlan]);

  const moveQueueSong = useCallback(
    (songId: number, direction: "down" | "up") => {
      dispatch({ direction, songId, type: "move-queue-song" });
    },
    [dispatch],
  );

  const removeFromQueue = useCallback((songId: number) => {
    runCommandPlan(
      getRemoveFromQueuePlaybackCommandPlan({
        songId,
        state: stateRef.current,
      }),
    );
  }, [runCommandPlan, stateRef]);

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
