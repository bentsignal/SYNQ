export const playerSeekStepMs = 15_000;

export const getPlaybackProgressPercent = ({
  duration,
  position,
}: {
  duration: number;
  position: number;
}) => {
  if (duration <= 0) {
    return 0;
  }

  return Math.round(Math.min(1, Math.max(0, position / duration)) * 100);
};

export const getSeekPositionFromProgressBar = ({
  duration,
  locationX,
  width,
}: {
  duration: number;
  locationX: number;
  width: number;
}) => {
  if (duration <= 0 || width <= 0) {
    return 0;
  }

  const ratio = Math.max(0, Math.min(locationX / width, 1));

  return ratio * duration;
};

export const getFreeListeningRemainingMs = ({
  accumulatedMs,
  thresholdMs,
}: {
  accumulatedMs: number;
  thresholdMs: number;
}) => Math.max(0, thresholdMs - accumulatedMs);

export const getSeekTargetPosition = ({
  direction,
  duration,
  position,
  stepMs = playerSeekStepMs,
}: {
  direction: "backward" | "forward";
  duration: number;
  position: number;
  stepMs?: number;
}) => {
  const offset = direction === "backward" ? -stepMs : stepMs;

  return Math.max(0, Math.min(duration, position + offset));
};
