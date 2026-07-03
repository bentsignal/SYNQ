import { useCallback, useMemo, type RefObject } from "react";
import {
  runPlaybackTransportPauseCommand,
  runPlaybackTransportPlaySongCommand,
  runPlaybackTransportResumeCommand,
  runPlaybackTransportSeekCommand,
  runPlaybackTransportSkipNextCommand,
  runPlaybackTransportSkipPreviousCommand,
} from "../services/playback-transport-command-flow-service";
import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";
import { usePlaybackResetCommand } from "./use-playback-reset-command";
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
      runPlaybackTransportPlaySongCommand({
        runAdGatedCommand,
        runCommandPlan,
        song,
      });
    },
    [runAdGatedCommand, runCommandPlan],
  );

  const pause = useCallback(() => {
    runPlaybackTransportPauseCommand({ runCommandPlan });
  }, [runCommandPlan]);

  const resume = useCallback(() => {
    runPlaybackTransportResumeCommand({
      runAdGatedCommand,
      runCommandPlan,
      state: stateRef.current,
    });
  }, [runAdGatedCommand, runCommandPlan, stateRef]);

  const seekTo = useCallback(
    (position: number) => {
      runPlaybackTransportSeekCommand({
        position,
        runAdGatedCommand,
        runCommandPlan,
      });
    },
    [runAdGatedCommand, runCommandPlan],
  );

  const skipNext = useCallback(() => {
    runPlaybackTransportSkipNextCommand({
      runAdGatedCommand,
      runCommandPlan,
      state: stateRef.current,
    });
  }, [runAdGatedCommand, runCommandPlan, stateRef]);

  const skipPrevious = useCallback(() => {
    runPlaybackTransportSkipPreviousCommand({
      runAdGatedCommand,
      runCommandPlan,
      state: stateRef.current,
    });
  }, [runAdGatedCommand, runCommandPlan, stateRef]);

  const resetPlaybackSession = usePlaybackResetCommand({ runCommandPlan });

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
