export type PlaybackCommandGateResult = "handled" | "started-ad";

export const runAdGatedPlaybackCommand = ({
  beginAdBreak,
  canRunPlaybackCommand,
  command,
}: {
  beginAdBreak: () => void;
  canRunPlaybackCommand: () => boolean;
  command: () => void;
}): PlaybackCommandGateResult => {
  if (canRunPlaybackCommand()) {
    command();
    return "handled";
  }

  beginAdBreak();
  return "started-ad";
};
