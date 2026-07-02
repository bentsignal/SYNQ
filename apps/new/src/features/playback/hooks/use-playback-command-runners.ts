import { useCallback } from "react";
import { runAdGatedPlaybackCommand } from "../services/playback-command-gate-service";
import {
  runPlaybackCommandPlan,
  type PlaybackCommandPlan,
} from "../services/playback-command-plan-service";
import type { PlaybackNativeCommandPlan } from "../services/playback-native-command-plan-service";
import type { PlaybackAction } from "../services/playback-session-service";

type UsePlaybackCommandRunnersParams = {
  beginAdBreak: () => void;
  canRunPlaybackCommand: () => boolean;
  dispatch: (action: PlaybackAction) => void;
  runNativeCommandPlan: (plan: PlaybackNativeCommandPlan) => void;
};

export function usePlaybackCommandRunners({
  beginAdBreak,
  canRunPlaybackCommand,
  dispatch,
  runNativeCommandPlan,
}: UsePlaybackCommandRunnersParams) {
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

  return {
    runAdGatedCommand,
    runCommandPlan,
  };
}

export type PlaybackRunAdGatedCommand = ReturnType<
  typeof usePlaybackCommandRunners
>["runAdGatedCommand"];

export type PlaybackRunCommandPlan = ReturnType<
  typeof usePlaybackCommandRunners
>["runCommandPlan"];
