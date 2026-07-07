import { useMemo, type RefObject } from "react";
import { createPlaybackCommands } from "../services/playback-command-controller-service";
import type { PlaybackNativeCommandPlan } from "../services/playback-native-command-plan-service";
import type { PlaybackAction } from "../services/playback-session-action-service";
import type { PlaybackCommands } from "../services/playback-session-value-service";
import type { PlaybackState } from "../types/playback-state";
import { usePlaybackCommandRunners } from "./use-playback-command-runners";
import { usePlaybackQueueCommands } from "./use-playback-queue-commands";
import { usePlaybackRemoteCommandController } from "./use-playback-remote-command-controller";
import { usePlaybackTransportCommands } from "./use-playback-transport-commands";

type UsePlaybackCommandControllerParams = {
  beginAdBreak: () => void;
  canRunPlaybackCommand: () => boolean;
  dispatch: (action: PlaybackAction) => void;
  finishActiveTrack: () => void;
  runNativeCommandPlan: (plan: PlaybackNativeCommandPlan) => void;
  stateRef: RefObject<PlaybackState>;
};

export function usePlaybackCommandController({
  beginAdBreak,
  canRunPlaybackCommand,
  dispatch,
  finishActiveTrack,
  runNativeCommandPlan,
  stateRef,
}: UsePlaybackCommandControllerParams): PlaybackCommands {
  const { runAdGatedCommand, runCommandPlan } = usePlaybackCommandRunners({
    beginAdBreak,
    canRunPlaybackCommand,
    dispatch,
    runNativeCommandPlan,
  });

  const transportCommands = usePlaybackTransportCommands({
    runAdGatedCommand,
    runCommandPlan,
    stateRef,
  });
  const queueCommands = usePlaybackQueueCommands({
    dispatch,
    runCommandPlan,
    stateRef,
  });
  const handleRemoteCommand = usePlaybackRemoteCommandController({
    beginAdBreak,
    canRunPlaybackCommand,
    finishActiveTrack,
    getActiveTrackId: () => stateRef.current.activeTrackId,
    pause: transportCommands.pause,
    runCommandPlan,
    resume: transportCommands.resume,
    seekTo: transportCommands.seekTo,
    skipNext: transportCommands.skipNext,
    skipPrevious: transportCommands.skipPrevious,
  });

  return useMemo(
    () =>
      createPlaybackCommands({
        handleRemoteCommand,
        queueCommands,
        transportCommands,
      }),
    [
      handleRemoteCommand,
      queueCommands,
      transportCommands,
    ],
  );
}
