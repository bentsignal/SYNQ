const durationFallback = "--:--";

const formatClockMs = (duration: number) => {
  const totalSeconds = Math.round(duration / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const formatDurationMs = (duration: number | null | undefined) => {
  if (!duration) {
    return durationFallback;
  }

  return formatClockMs(duration);
};

export const formatRemainingDurationMs = ({
  duration,
  position,
}: {
  duration: number;
  position: number;
}) => {
  if (!duration) {
    return durationFallback;
  }

  return `-${formatClockMs(Math.max(0, duration - position))}`;
};
