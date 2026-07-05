import type { PlaybackAdGateState } from "../types/playback-state";
import { getPlaybackAdProgressUpdate } from "./playback-ad-gate-progress-service";

const getResetPlaybackAdGate = (
  gate: PlaybackAdGateState,
): PlaybackAdGateState => ({
  ...gate,
  accumulatedMs: 0,
  active: false,
  playbackDuration: 0,
  playbackPosition: 0,
  due: false,
  lastTrackedPosition: null,
});

export const trackPlaybackAdProgress = ({
  currentPosition,
  gate,
  premiumActive,
}: {
  currentPosition: number;
  gate: PlaybackAdGateState;
  premiumActive: boolean;
}): PlaybackAdGateState => {
  if (premiumActive) {
    return getResetPlaybackAdGate(gate);
  }

  if (gate.active || gate.due) {
    return gate;
  }

  const progressUpdate = getPlaybackAdProgressUpdate({
    currentPosition,
    gate,
  });
  if (!progressUpdate) {
    return gate;
  }

  if (
    progressUpdate.accumulatedMs === gate.accumulatedMs &&
    progressUpdate.lastTrackedPosition !== gate.lastTrackedPosition
  ) {
    return {
      ...gate,
      lastTrackedPosition: progressUpdate.lastTrackedPosition,
    };
  }

  return {
    ...gate,
    accumulatedMs: progressUpdate.accumulatedMs,
    due: progressUpdate.due,
    lastTrackedPosition: progressUpdate.lastTrackedPosition,
  };
};
