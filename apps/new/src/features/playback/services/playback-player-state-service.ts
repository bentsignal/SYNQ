import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";
import { getPlaybackPlayerActionState } from "./playback-player-action-state-service";

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

export const getPlaybackPlayerViewState = ({
  activeTrack,
  state,
}: {
  activeTrack: PlaybackQueueItem | null;
  state: PlaybackState;
}) => ({
  actionState: getPlaybackPlayerActionState({ activeTrack, state }),
  adProgressPercent: getPlaybackProgressPercent({
    duration: state.adGate.playbackDuration,
    position: state.adGate.playbackPosition,
  }),
  freeListeningRemainingMs: getFreeListeningRemainingMs({
    accumulatedMs: state.adGate.accumulatedMs,
    thresholdMs: state.adGate.thresholdMs,
  }),
  progressPercent: getPlaybackProgressPercent({
    duration: state.duration,
    position: state.position,
  }),
});
