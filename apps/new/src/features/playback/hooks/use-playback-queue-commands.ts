import { useCallback, useMemo, type RefObject } from "react";
import type { PlaybackQueueCommands } from "../services/playback-queue-command-service";
import {
  runPlaybackQueueAddSongCommand,
  runPlaybackQueueClearSessionCommand,
  runPlaybackQueueMoveSongCommand,
  runPlaybackQueueRemoveSongCommand,
  runPlaybackQueueToggleLoopCommand,
  runPlaybackQueueToggleShuffleCommand,
} from "../services/playback-queue-session-command-flow-service";
import type { PlaybackAction } from "../services/playback-session-action-service";
import type { PlaybackState } from "../types/playback-state";
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
}: UsePlaybackQueueCommandsParams): PlaybackQueueCommands {
  const addToQueue = useCallback<PlaybackQueueCommands["addToQueue"]>(
    (song) => {
      runPlaybackQueueAddSongCommand({ dispatch, song });
    },
    [dispatch],
  );
  const clearQueue = useCallback<PlaybackQueueCommands["clearQueue"]>(() => {
    runPlaybackQueueClearSessionCommand({ runCommandPlan });
  }, [runCommandPlan]);
  const moveQueueSong = useCallback<PlaybackQueueCommands["moveQueueSong"]>(
    (songId, direction) => {
      runPlaybackQueueMoveSongCommand({ direction, dispatch, songId });
    },
    [dispatch],
  );
  const removeFromQueue = useCallback<PlaybackQueueCommands["removeFromQueue"]>(
    (songId) => {
      runPlaybackQueueRemoveSongCommand({
        runCommandPlan,
        songId,
        state: stateRef.current,
      });
    },
    [runCommandPlan, stateRef],
  );
  const toggleLoop = useCallback<PlaybackQueueCommands["toggleLoop"]>(() => {
    runPlaybackQueueToggleLoopCommand({
      runCommandPlan,
      state: stateRef.current,
    });
  }, [runCommandPlan, stateRef]);
  const toggleShuffle = useCallback<PlaybackQueueCommands["toggleShuffle"]>(() => {
    runPlaybackQueueToggleShuffleCommand({
      runCommandPlan,
      state: stateRef.current,
    });
  }, [runCommandPlan, stateRef]);

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
