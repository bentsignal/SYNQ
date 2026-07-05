import { useCallback, useMemo, type RefObject } from "react";
import {
  createPlaybackTransportCommands,
} from "../services/playback-transport-command-service";
import type { PlaybackState } from "../types/playback-state";
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
  const getState = useCallback(() => stateRef.current, [stateRef]);
  const transportCommands = useMemo(
    () =>
      createPlaybackTransportCommands({
        getState,
        runAdGatedCommand,
        runCommandPlan,
      }),
    [getState, runAdGatedCommand, runCommandPlan],
  );
  const resetPlaybackSession = usePlaybackResetCommand({ runCommandPlan });

  return useMemo(
    () => ({
      ...transportCommands,
      resetPlaybackSession,
    }),
    [resetPlaybackSession, transportCommands],
  );
}
