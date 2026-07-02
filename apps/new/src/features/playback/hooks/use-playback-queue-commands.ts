import { useCallback, useMemo, type RefObject } from "react";
import {
  getClearQueuePlaybackCommandPlan,
  getRemoveFromQueuePlaybackCommandPlan,
} from "../services/playback-command-plan-service";
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
    dispatch({ song, type: "add-to-queue" });
  }, [dispatch]);

  const clearQueue = useCallback(() => {
    runCommandPlan(getClearQueuePlaybackCommandPlan());
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
