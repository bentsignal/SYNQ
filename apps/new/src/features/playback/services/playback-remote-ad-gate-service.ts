import type {
  PlaybackRemoteCommandHandlers,
  PlaybackRemoteCommandResult,
} from "./playback-remote-command-service";

export const runAdGatedRemoteCommand = ({
  command,
  handlers,
}: {
  command: () => void;
  handlers: PlaybackRemoteCommandHandlers;
}): PlaybackRemoteCommandResult => {
  if (!handlers.canRunPlaybackCommand()) {
    handlers.beginAdBreak();
    return "started-ad";
  }

  command();
  return "handled";
};

export const runSeekRemoteCommand = ({
  handlers,
  position,
}: {
  handlers: PlaybackRemoteCommandHandlers;
  position: number;
}): PlaybackRemoteCommandResult => {
  if (!handlers.canRunPlaybackCommand()) {
    return "blocked-by-ad";
  }

  handlers.seekTo(position);
  return "handled";
};
