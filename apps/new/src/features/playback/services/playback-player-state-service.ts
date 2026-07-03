import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";
import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";

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

type PlaybackPlayerCommand = {
  haptic: HapticFeedbackType;
};

type PlaybackPlayerSeekCommand = PlaybackPlayerCommand & {
  targetPosition: number;
};

type PlaybackPlayerPlayPauseCommand = PlaybackPlayerCommand & {
  action: "pause" | "resume";
};

export const getPlaybackPlayerButtonCommand = (): PlaybackPlayerCommand => ({
  haptic: "light",
});

export const getPlaybackPlayerSeekCommand = ({
  direction,
  state,
}: {
  direction: "backward" | "forward";
  state: Pick<PlaybackState, "duration" | "position">;
}): PlaybackPlayerSeekCommand => ({
  haptic: "light",
  targetPosition: getSeekTargetPosition({
    direction,
    duration: state.duration,
    position: state.position,
  }),
});

export const getPlaybackPlayerPlayPauseCommand = ({
  isPlaying,
}: {
  isPlaying: boolean;
}): PlaybackPlayerPlayPauseCommand => ({
  action: isPlaying ? "pause" : "resume",
  haptic: isPlaying ? "soft" : "light",
});

export const getPlaybackPlayerActionState = ({
  activeTrack,
  state,
}: {
  activeTrack: PlaybackQueueItem | null;
  state: PlaybackState;
}) => {
  const hasActiveTrack = activeTrack !== null;
  const adBreakActive = state.adGate.active || state.adGate.due;
  const canRunTrackCommand = hasActiveTrack && !adBreakActive;

  return {
    adBreakActive,
    canEditActiveTrack: canRunTrackCommand,
    canFastForward:
      canRunTrackCommand && state.duration > 0 && state.position < state.duration,
    canPlayPause: canRunTrackCommand,
    canRewind: canRunTrackCommand && state.position > 0,
    canSkipNext: canRunTrackCommand,
    canSkipPrevious: canRunTrackCommand,
    loopLabel: state.mode.loop ? "Loop On" : "Loop Off",
    playPauseLabel: state.isPlaying ? "Pause" : "Play",
    shuffleLabel: state.mode.shuffle ? "Shuffle On" : "Shuffle Off",
  };
};

export type PlaybackPlayerActionState = ReturnType<
  typeof getPlaybackPlayerActionState
>;

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
