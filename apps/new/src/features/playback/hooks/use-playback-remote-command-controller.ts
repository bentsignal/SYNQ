import { useMemo } from "react";
import {
  createPlaybackRemoteCommandHandler,
} from "../services/playback-remote-command-handler-service";
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
  return useMemo(
    () =>
      createPlaybackRemoteCommandHandler({
        beginAdBreak,
        canRunPlaybackCommand,
        finishActiveTrack,
        pause,
        resume,
        runCommandPlan,
        seekTo,
        skipNext,
        skipPrevious,
      }),
    [
      beginAdBreak,
      canRunPlaybackCommand,
      finishActiveTrack,
      pause,
      resume,
      runCommandPlan,
      seekTo,
      skipNext,
      skipPrevious,
    ],
  );
}
