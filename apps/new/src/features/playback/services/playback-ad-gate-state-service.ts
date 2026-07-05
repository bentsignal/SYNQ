import type { PlaybackAdGateState } from "../types/playback-state";
import { playbackAdThresholdMs } from "./playback-ad-gate-progress-service";

export {
  getPlaybackAdProgressUpdate,
  playbackAdProgressIntervalMs,
  playbackAdThresholdMs,
} from "./playback-ad-gate-progress-service";
export { trackPlaybackAdProgress } from "./playback-ad-gate-tracking-service";

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
