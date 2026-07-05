import type { PlaybackQueueCommands } from "./playback-queue-command-service";
import type {
  PlaybackRemoteCommand,
  PlaybackRemoteCommandResult,
} from "./playback-remote-command-service";
import type { PlaybackCommands } from "./playback-session-value-service";
import type { PlaybackTransportCommands } from "./playback-transport-command-service";

type CreatePlaybackCommandsParams = {
  handleRemoteCommand: (
    command: PlaybackRemoteCommand,
  ) => PlaybackRemoteCommandResult;
  queueCommands: PlaybackQueueCommands;
  transportCommands: PlaybackTransportCommands & {
    resetPlaybackSession: () => void;
  };
};

export const createPlaybackCommands = ({
  handleRemoteCommand,
  queueCommands,
  transportCommands,
}: CreatePlaybackCommandsParams): PlaybackCommands => ({
  handleRemoteCommand,
  ...queueCommands,
  ...transportCommands,
});
