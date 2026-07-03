import { useCallback, useMemo, type RefObject } from "react";
import {
  runPlaybackQueueAddSongCommand,
  runPlaybackQueueClearSessionCommand,
  runPlaybackQueueMoveSongCommand,
  runPlaybackQueueRemoveSongCommand,
  runPlaybackQueueToggleLoopCommand,
  runPlaybackQueueToggleShuffleCommand,
} from "../services/playback-queue-session-command-flow-service";
import type { PlaybackAction } from "../services/playback-session-service";
import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";
import type { PlaybackRunCommandPlan } from "./use-playback-command-runners";

type UsePlaybackQueueCommandsParams = {
  dispatch: (action: PlaybackAction) => void;
  runCommandPlan: PlaybackRunCommandPlan;
  stateRef: RefObject<PlaybackState>;
};

export function usePlaybackQueueCommands({
  dispatch,
  runCommandPlan,
  stateRef,
}: UsePlaybackQueueCommandsParams) {
  const addToQueue = useCallback((song: PlaybackQueueItem) => {
    runPlaybackQueueAddSongCommand({ dispatch, song });
  }, [dispatch]);

  const clearQueue = useCallback(() => {
    runPlaybackQueueClearSessionCommand({ runCommandPlan });
  }, [runCommandPlan]);

  const moveQueueSong = useCallback(
    (songId: number, direction: "down" | "up") => {
      runPlaybackQueueMoveSongCommand({ direction, dispatch, songId });
    },
    [dispatch],
  );

  const removeFromQueue = useCallback((songId: number) => {
    runPlaybackQueueRemoveSongCommand({
      runCommandPlan,
      songId,
      state: stateRef.current,
    });
  }, [runCommandPlan, stateRef]);

  const toggleLoop = useCallback(() => {
    runPlaybackQueueToggleLoopCommand({ dispatch });
  }, [dispatch]);

  const toggleShuffle = useCallback(() => {
    runPlaybackQueueToggleShuffleCommand({ dispatch });
  }, [dispatch]);

  return useMemo(
    () => ({
      addToQueue,
      clearQueue,
      moveQueueSong,
      removeFromQueue,
      toggleLoop,
      toggleShuffle,
    }),
    [
      addToQueue,
      clearQueue,
      moveQueueSong,
      removeFromQueue,
      toggleLoop,
      toggleShuffle,
    ],
  );
}
