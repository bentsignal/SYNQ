export const getPlaybackTimelineSeconds = ({
  duration,
  position,
}: {
  duration: number;
  position: number;
}) => {
  const elapsedSec = Math.floor(position);

  return {
    elapsedSec,
    remainingSec: Math.floor(duration) - elapsedSec,
  };
};

export const getPlaybackProgressCompletion = ({
  duration,
  position,
}: {
  duration: number;
  position: number;
}) => {
  return duration === 0 ? 0 : position / duration;
};

export const clampTimelineCompletion = (completion: number) => {
  "worklet";

  return Math.max(0, Math.min(completion, 1));
};

export const getScrubbedTimelineTimes = ({
  completion,
  duration,
}: {
  completion: number;
  duration: number;
}) => {
  "worklet";

  const sharedDuration = Math.floor(duration);
  const elapsedSec = Math.max(
    0,
    Math.min(Math.floor(completion * sharedDuration), sharedDuration),
  );

  return {
    elapsedSec,
    remainingSec: sharedDuration - elapsedSec,
  };
};

export const getTimelineSeekPosition = ({
  completion,
  duration,
}: {
  completion: number;
  duration: number;
}) => {
  "worklet";

  return Math.min(Math.max(0, completion * duration), duration);
};
