export type PlaybackRemoteCommand =
  | { type: "error"; message: string }
  | { type: "next" }
  | { type: "pause" }
  | { type: "play" }
  | { type: "previous" }
  | { type: "queue-ended" }
  | { position: number; type: "seek" };

export type PlaybackRemoteCommandResult =
  | "blocked-by-ad"
  | "handled"
  | "started-ad";

export type PlaybackRemoteCommandHandlers = {
  beginAdBreak: () => void;
  canRunPlaybackCommand: () => boolean;
  fail: (message: string) => void;
  pause: () => void;
  queueEnded: () => void;
  resume: () => void;
  seekTo: (position: number) => void;
  skipNext: () => void;
  skipPrevious: () => void;
};

const runAdGatedRemoteCommand = ({
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

export const handlePlaybackRemoteCommand = ({
  command,
  handlers,
}: {
  command: PlaybackRemoteCommand;
  handlers: PlaybackRemoteCommandHandlers;
}): PlaybackRemoteCommandResult => {
  switch (command.type) {
    case "play":
      return runAdGatedRemoteCommand({
        command: handlers.resume,
        handlers,
      });
    case "pause":
      handlers.pause();
      return "handled";
    case "next":
      return runAdGatedRemoteCommand({
        command: handlers.skipNext,
        handlers,
      });
    case "previous":
      return runAdGatedRemoteCommand({
        command: handlers.skipPrevious,
        handlers,
      });
    case "seek":
      if (!handlers.canRunPlaybackCommand()) {
        return "blocked-by-ad";
      }

      handlers.seekTo(command.position);
      return "handled";
    case "queue-ended":
      return runAdGatedRemoteCommand({
        command: handlers.queueEnded,
        handlers,
      });
    case "error":
      handlers.fail(command.message);
      return "handled";
  }
};
