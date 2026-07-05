import {
  getRemoteFailurePlaybackCommandPlan,
  type PlaybackCommandPlan,
} from "./playback-command-plan-service";
import {
  handlePlaybackRemoteCommand,
  type PlaybackRemoteCommand,
} from "./playback-remote-command-service";

type CreatePlaybackRemoteCommandHandlerParams = {
  beginAdBreak: () => void;
  canRunPlaybackCommand: () => boolean;
  finishActiveTrack: () => void;
  pause: () => void;
  resume: () => void;
  runCommandPlan: (plan: PlaybackCommandPlan) => void;
  seekTo: (position: number) => void;
  skipNext: () => void;
  skipPrevious: () => void;
};

export type PlaybackRemoteCommandHandler = (
  command: PlaybackRemoteCommand,
) => ReturnType<typeof handlePlaybackRemoteCommand>;

export const createPlaybackRemoteCommandHandler = ({
  beginAdBreak,
  canRunPlaybackCommand,
  finishActiveTrack,
  pause,
  resume,
  runCommandPlan,
  seekTo,
  skipNext,
  skipPrevious,
}: CreatePlaybackRemoteCommandHandlerParams): PlaybackRemoteCommandHandler => {
  const fail = (message: string) => {
    runCommandPlan(getRemoteFailurePlaybackCommandPlan(message));
  };

  return (command) =>
    handlePlaybackRemoteCommand({
      command,
      handlers: {
        beginAdBreak,
        canRunPlaybackCommand,
        fail,
        pause,
        queueEnded: finishActiveTrack,
        resume,
        seekTo,
        skipNext,
        skipPrevious,
      },
    });
};
