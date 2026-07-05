import { useMemo } from "react";
import {
  createPlaybackCommandRunners,
} from "../services/playback-command-runner-service";
import type { PlaybackNativeCommandPlan } from "../services/playback-native-command-plan-service";
import type { PlaybackAction } from "../services/playback-session-action-service";

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
  return useMemo(
    () =>
      createPlaybackCommandRunners({
        beginAdBreak,
        canRunPlaybackCommand,
        dispatch,
        runNativeCommandPlan,
      }),
    [beginAdBreak, canRunPlaybackCommand, dispatch, runNativeCommandPlan],
  );
}

export type PlaybackRunAdGatedCommand = ReturnType<
  typeof usePlaybackCommandRunners
>["runAdGatedCommand"];

export type PlaybackRunCommandPlan = ReturnType<
  typeof usePlaybackCommandRunners
>["runCommandPlan"];
