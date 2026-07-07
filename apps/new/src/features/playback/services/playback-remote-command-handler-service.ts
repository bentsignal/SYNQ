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
  getActiveTrackId: () => number | null;
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
  getActiveTrackId,
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
        getActiveTrackId,
        pause,
        queueEnded: finishActiveTrack,
        resume,
        seekTo,
        skipNext,
        skipPrevious,
      },
    });
};
