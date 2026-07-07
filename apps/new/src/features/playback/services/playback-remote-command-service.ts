import {
  runAdGatedRemoteCommand,
  runSeekRemoteCommand,
} from "./playback-remote-ad-gate-service";

export type PlaybackRemoteCommand =
  | { type: "error"; message: string }
  | { targetTrackId?: number | null; type: "next" }
  | { type: "pause" }
  | { type: "play" }
  | { targetTrackId?: number | null; type: "previous" }
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
      if (command.targetTrackId !== undefined) {
        return "handled";
      }

      return runAdGatedRemoteCommand({
        command: handlers.skipNext,
        handlers,
      });
    case "previous":
      if (
        command.targetTrackId !== undefined
      ) {
        return "handled";
      }

      return runAdGatedRemoteCommand({
        command: handlers.skipPrevious,
        handlers,
      });
    case "seek":
      return runSeekRemoteCommand({
        handlers,
        position: command.position,
      });
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
