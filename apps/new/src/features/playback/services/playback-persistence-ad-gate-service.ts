import {
  initialPlaybackAdGateState,
  resetPlaybackAdGate,
} from "./playback-ad-gate-state-service";
import type { PlaybackAdGateState } from "../types/playback-state";
import {
  finiteNumber,
  isRecord,
  numberOrNull,
} from "./playback-persistence-step-service";

export const normalizeAdGate = (value: unknown): PlaybackAdGateState => {
  if (!isRecord(value)) {
    return initialPlaybackAdGateState;
  }

  const thresholdMs = finiteNumber(
    value.thresholdMs,
    initialPlaybackAdGateState.thresholdMs,
  );
  const accumulatedMs = Math.min(
    thresholdMs,
    Math.max(0, finiteNumber(value.accumulatedMs, 0)),
  );
  const playbackDuration = Math.max(
    0,
    finiteNumber(value.playbackDuration, 0),
  );
  const playbackPosition = Math.min(
    playbackDuration,
    Math.max(0, finiteNumber(value.playbackPosition, 0)),
  );
  const active = typeof value.active === "boolean" ? value.active : false;
  const due =
    typeof value.due === "boolean" ? value.due : accumulatedMs >= thresholdMs;
  const lastTrackedPosition = numberOrNull(value.lastTrackedPosition);

  return {
    accumulatedMs,
    active,
    playbackDuration,
    playbackPosition,
    due,
    lastTrackedPosition:
      lastTrackedPosition !== null && lastTrackedPosition >= 0
        ? lastTrackedPosition
        : null,
    thresholdMs,
  };
};

export const normalizeRestoredAdGate = (value: unknown) => {
  const adGate = normalizeAdGate(value);

  return adGate.active ? resetPlaybackAdGate(adGate) : adGate;
};
