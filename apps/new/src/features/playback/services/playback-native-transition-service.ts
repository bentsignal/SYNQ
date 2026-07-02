import type { PlaybackState } from "../types/playback-state";
import {
  beginPlaybackAdBreak,
  completePlaybackAdBreak,
  resetPlaybackAdGate,
  trackPlaybackAdProgress,
  updatePlaybackAdBreakProgress,
} from "./playback-ad-gate-service";
import type { TrackPlayerStatusSnapshot } from "./playback-native-status-service";

export const beginPlaybackAdBreakTransition = (
  state: PlaybackState,
): PlaybackState => ({
  ...state,
  adGate: beginPlaybackAdBreak(state.adGate),
  isPlaying: false,
});

export const completePlaybackAdBreakTransition = (
  state: PlaybackState,
): PlaybackState => ({
  ...state,
  adGate: completePlaybackAdBreak(state.adGate),
  error: null,
  isPlaying: state.activeTrackId !== null,
});

export const applyPlaybackNativeStatus = ({
  premiumActive,
  state,
  status,
}: {
  premiumActive: boolean;
  state: PlaybackState;
  status: TrackPlayerStatusSnapshot;
}): PlaybackState => {
  if (!status.isLoaded) {
    return state;
  }

  if (status.source === "ad") {
    return {
      ...state,
      adGate: updatePlaybackAdBreakProgress({
        duration: status.duration,
        position: status.position,
        state: state.adGate,
      }),
      isPlaying: false,
    };
  }

  return {
    ...state,
    adGate: status.isPlaying
      ? trackPlaybackAdProgress({
          currentPosition: status.position,
          gate: state.adGate,
          premiumActive,
        })
      : state.adGate,
    duration: status.duration ?? state.duration,
    isPlaying: status.isPlaying,
    position: Math.max(0, status.position),
  };
};

export const finishPlaybackNativeTrack = ({
  state,
  targetIndex,
}: {
  state: PlaybackState;
  targetIndex: number | null;
}): PlaybackState => {
  const nextTrack =
    targetIndex === null ? null : state.queue[targetIndex] ?? null;

  if (!nextTrack) {
    return {
      ...state,
      isPlaying: false,
      position: state.duration,
    };
  }

  return {
    ...state,
    activeQueueIndex: targetIndex,
    activeTrackId: nextTrack.id,
    duration: nextTrack.duration ?? 0,
    isPlaying: true,
    position: 0,
  };
};

export const syncPlaybackPremiumState = ({
  premiumActive,
  state,
}: {
  premiumActive: boolean;
  state: PlaybackState;
}): PlaybackState => ({
  ...state,
  adGate: premiumActive ? resetPlaybackAdGate(state.adGate) : state.adGate,
  isPlaying:
    premiumActive && state.adGate.active
      ? state.activeTrackId !== null
      : state.isPlaying,
});
