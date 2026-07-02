import { useCallback } from "react";
import {
  handlePlaybackRemoteCommand,
  type PlaybackRemoteCommand,
} from "../services/playback-remote-command-service";

type UsePlaybackRemoteCommandControllerParams = {
  beginAdBreak: () => void;
  canRunPlaybackCommand: () => boolean;
  failFromRemoteCommand: (message: string) => void;
  finishActiveTrack: () => void;
  pause: () => void;
  resume: () => void;
  seekTo: (position: number) => void;
  skipNext: () => void;
  skipPrevious: () => void;
};

export function usePlaybackRemoteCommandController({
  beginAdBreak,
  canRunPlaybackCommand,
  failFromRemoteCommand,
  finishActiveTrack,
  pause,
  resume,
  seekTo,
  skipNext,
  skipPrevious,
}: UsePlaybackRemoteCommandControllerParams) {
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
