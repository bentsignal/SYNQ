import { useCallback, useMemo, type RefObject } from "react";
import {
  getPausePlaybackCommandPlan,
  getPlaySongPlaybackCommandPlan,
  getResetPlaybackCommandPlan,
  getResumePlaybackCommandPlan,
  getSeekToPlaybackCommandPlan,
  getSkipNextPlaybackCommandPlan,
  getSkipPreviousPlaybackCommandPlan,
} from "../services/playback-command-plan-service";
import { clearPersistedPlaybackState } from "../services/playback-persistence-service";
import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";
import type {
  PlaybackRunAdGatedCommand,
  PlaybackRunCommandPlan,
} from "./use-playback-command-runners";

type UsePlaybackTransportCommandsParams = {
  runAdGatedCommand: PlaybackRunAdGatedCommand;
  runCommandPlan: PlaybackRunCommandPlan;
  stateRef: RefObject<PlaybackState>;
};

export function usePlaybackTransportCommands({
  runAdGatedCommand,
  runCommandPlan,
  stateRef,
}: UsePlaybackTransportCommandsParams) {
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

  const resetPlaybackSession = useCallback(() => {
    void clearPersistedPlaybackState();
    runCommandPlan(getResetPlaybackCommandPlan());
  }, [runCommandPlan]);

  return useMemo(
    () => ({
      pause,
      playSong,
      resetPlaybackSession,
      resume,
      seekTo,
      skipNext,
      skipPrevious,
    }),
    [
      pause,
      playSong,
      resetPlaybackSession,
      resume,
      seekTo,
      skipNext,
      skipPrevious,
    ],
  );
}
