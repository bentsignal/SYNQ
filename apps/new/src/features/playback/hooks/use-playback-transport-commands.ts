import { useCallback, useMemo, type RefObject } from "react";
import type { PlaybackState } from "../types/playback-state";
import { usePlaybackResetCommand } from "./use-playback-reset-command";
import type {
  PlaybackRunAdGatedCommand,
  PlaybackRunCommandPlan,
} from "./use-playback-command-runners";
import {
  runPlaybackTransportPauseCommand,
  runPlaybackTransportPlaySongCommand,
  runPlaybackTransportResumeCommand,
  runPlaybackTransportSeekCommand,
  runPlaybackTransportSkipNextCommand,
  runPlaybackTransportSkipPreviousCommand,
} from "../services/playback-transport-command-flow-service";
import type { PlaybackTransportCommands } from "../services/playback-transport-command-service";

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
  const pause = useCallback<PlaybackTransportCommands["pause"]>(() => {
    runPlaybackTransportPauseCommand({ runCommandPlan });
  }, [runCommandPlan]);
  const playSong = useCallback<PlaybackTransportCommands["playSong"]>(
    (song) => {
      runPlaybackTransportPlaySongCommand({
        runAdGatedCommand,
        runCommandPlan,
        song,
        state: stateRef.current,
      });
    },
    [runAdGatedCommand, runCommandPlan, stateRef],
  );
  const resume = useCallback<PlaybackTransportCommands["resume"]>(() => {
    runPlaybackTransportResumeCommand({
      runAdGatedCommand,
      runCommandPlan,
      state: stateRef.current,
    });
  }, [runAdGatedCommand, runCommandPlan, stateRef]);
  const seekTo = useCallback<PlaybackTransportCommands["seekTo"]>(
    (position) => {
      runPlaybackTransportSeekCommand({
        position,
        runAdGatedCommand,
        runCommandPlan,
      });
    },
    [runAdGatedCommand, runCommandPlan],
  );
  const skipNext = useCallback<PlaybackTransportCommands["skipNext"]>(() => {
    runPlaybackTransportSkipNextCommand({
      runAdGatedCommand,
      runCommandPlan,
      state: stateRef.current,
    });
  }, [runAdGatedCommand, runCommandPlan, stateRef]);
  const skipPrevious = useCallback<PlaybackTransportCommands["skipPrevious"]>(() => {
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
