import type { PlaybackAdGateState } from "../types/playback-state";

export const playbackAdThresholdMs = 600_000;
export const playbackAdProgressIntervalMs = 5_000;

export const getPlaybackAdProgressUpdate = ({
  currentPosition,
  gate,
}: {
  currentPosition: number;
  gate: Pick<
    PlaybackAdGateState,
    "accumulatedMs" | "lastTrackedPosition" | "thresholdMs"
  >;
}) => {
  const lastTrackedPosition = gate.lastTrackedPosition;
  if (lastTrackedPosition === null || currentPosition < lastTrackedPosition) {
    return {
      accumulatedMs: gate.accumulatedMs,
      due: false,
      lastTrackedPosition: currentPosition,
    };
  }

  const elapsedMs = currentPosition - lastTrackedPosition;
  if (elapsedMs < playbackAdProgressIntervalMs) {
    return null;
  }

  const intervals = Math.floor(elapsedMs / playbackAdProgressIntervalMs);
  const nextAccumulatedMs =
    gate.accumulatedMs + intervals * playbackAdProgressIntervalMs;
  const nextTrackedPosition =
    lastTrackedPosition + intervals * playbackAdProgressIntervalMs;

  return {
    accumulatedMs: nextAccumulatedMs,
    due: nextAccumulatedMs >= gate.thresholdMs,
    lastTrackedPosition: nextTrackedPosition,
  };
};
