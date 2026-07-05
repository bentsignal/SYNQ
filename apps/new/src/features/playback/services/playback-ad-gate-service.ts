import type { PlaybackAdGateState } from "../types/playback-state";
import type { PlaybackAction } from "./playback-session-action-service";

export const playbackAdThresholdMs = 600_000;
export const playbackAdProgressIntervalMs = 5_000;

export const initialPlaybackAdGateState: PlaybackAdGateState = {
  accumulatedMs: 0,
  active: false,
  playbackDuration: 0,
  playbackPosition: 0,
  due: false,
  lastTrackedPosition: null,
  thresholdMs: playbackAdThresholdMs,
};

export const getBeginPlaybackAdBreakAction = (): PlaybackAction => ({
  type: "begin-ad-break",
});

export const getCompletePlaybackAdBreakAction = (): PlaybackAction => ({
  type: "complete-ad-break",
});

export const getSyncPlaybackPremiumAction = (
  premiumActive: boolean,
): PlaybackAction => ({
  premiumActive,
  type: "sync-premium",
});

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

  const lastTrackedPosition = gate.lastTrackedPosition;
  if (lastTrackedPosition === null || currentPosition < lastTrackedPosition) {
    return {
      ...gate,
      lastTrackedPosition: currentPosition,
    };
  }

  const elapsedMs = currentPosition - lastTrackedPosition;
  if (elapsedMs < playbackAdProgressIntervalMs) {
    return gate;
  }

  const intervals = Math.floor(elapsedMs / playbackAdProgressIntervalMs);
  const nextAccumulatedMs =
    gate.accumulatedMs + intervals * playbackAdProgressIntervalMs;
  const nextTrackedPosition =
    lastTrackedPosition + intervals * playbackAdProgressIntervalMs;
  const due = nextAccumulatedMs >= gate.thresholdMs;

  return {
    ...gate,
    accumulatedMs: nextAccumulatedMs,
    due,
    lastTrackedPosition: nextTrackedPosition,
  };
};
