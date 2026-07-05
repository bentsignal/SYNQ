import type { PlaybackAdGateState } from "../types/playback-state";
import {
  getPlaybackAdProgressUpdate,
  playbackAdThresholdMs,
} from "./playback-ad-gate-progress-service";

export {
  getPlaybackAdProgressUpdate,
  playbackAdProgressIntervalMs,
  playbackAdThresholdMs,
} from "./playback-ad-gate-progress-service";

export const initialPlaybackAdGateState: PlaybackAdGateState = {
  accumulatedMs: 0,
  active: false,
  playbackDuration: 0,
  playbackPosition: 0,
  due: false,
  lastTrackedPosition: null,
  thresholdMs: playbackAdThresholdMs,
};

export const resetPlaybackAdGate = (
  state: PlaybackAdGateState = initialPlaybackAdGateState,
): PlaybackAdGateState => ({
  ...state,
  accumulatedMs: 0,
  active: false,
  playbackDuration: 0,
  playbackPosition: 0,
  due: false,
  lastTrackedPosition: null,
});

export const beginPlaybackAdBreak = (
  state: PlaybackAdGateState,
): PlaybackAdGateState => ({
  ...state,
  active: true,
  playbackDuration: 0,
  playbackPosition: 0,
  due: true,
});

export const completePlaybackAdBreak = (
  state: PlaybackAdGateState,
): PlaybackAdGateState => resetPlaybackAdGate(state);

export const updatePlaybackAdBreakProgress = ({
  duration,
  position,
  state,
}: {
  duration: number | null;
  position: number;
  state: PlaybackAdGateState;
}): PlaybackAdGateState => ({
  ...state,
  playbackDuration: Math.max(0, duration ?? state.playbackDuration),
  playbackPosition: Math.max(0, position),
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
    return resetPlaybackAdGate(gate);
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
