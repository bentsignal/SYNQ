import { useCallback, useMemo, type RefObject } from "react";
import {
  createPlaybackQueueCommands,
  type PlaybackQueueCommands,
} from "../services/playback-queue-command-service";
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
  const getState = useCallback(() => stateRef.current, [stateRef]);

  return useMemo(
    () => createPlaybackQueueCommands({
      dispatch,
      getState,
      runCommandPlan,
    }),
    [dispatch, getState, runCommandPlan],
  );
}
