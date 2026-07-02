import { useCallback } from "react";
import { getRemoteFailurePlaybackCommandPlan } from "../services/playback-command-plan-service";
import {
  handlePlaybackRemoteCommand,
  type PlaybackRemoteCommand,
} from "../services/playback-remote-command-service";
import type { PlaybackRunCommandPlan } from "./use-playback-command-runners";

type UsePlaybackRemoteCommandControllerParams = {
  beginAdBreak: () => void;
  canRunPlaybackCommand: () => boolean;
  finishActiveTrack: () => void;
  pause: () => void;
  runCommandPlan: PlaybackRunCommandPlan;
  resume: () => void;
  seekTo: (position: number) => void;
  skipNext: () => void;
  skipPrevious: () => void;
};

export function usePlaybackRemoteCommandController({
  beginAdBreak,
  canRunPlaybackCommand,
  finishActiveTrack,
  pause,
  runCommandPlan,
  resume,
  seekTo,
  skipNext,
  skipPrevious,
}: UsePlaybackRemoteCommandControllerParams) {
  const failFromRemoteCommand = useCallback((message: string) => {
    runCommandPlan(getRemoteFailurePlaybackCommandPlan(message));
  }, [runCommandPlan]);

  return useCallback(
    (command: PlaybackRemoteCommand) =>
      handlePlaybackRemoteCommand({
        command,
        handlers: {
          beginAdBreak,
          canRunPlaybackCommand,
          fail: failFromRemoteCommand,
          pause,
          queueEnded: finishActiveTrack,
          resume,
          seekTo,
          skipNext,
          skipPrevious,
        },
      }),
    [
      beginAdBreak,
      canRunPlaybackCommand,
      failFromRemoteCommand,
      finishActiveTrack,
      pause,
      resume,
      seekTo,
      skipNext,
      skipPrevious,
    ],
  );
}
