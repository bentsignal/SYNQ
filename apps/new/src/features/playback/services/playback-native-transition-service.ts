import type { PlaybackState } from "../types/playback-state";
import type { PlaybackAction } from "./playback-session-service";
import {
  beginPlaybackAdBreak,
  completePlaybackAdBreak,
  resetPlaybackAdGate,
} from "./playback-ad-gate-service";
import { setPlaybackActiveQueueIndex } from "./playback-active-track-service";
import type { TrackPlayerStatusSnapshot } from "./playback-native-status-service";
import {
  getPlaybackAdStatusUpdate,
  getPlaybackLibraryStatusUpdate,
} from "./playback-native-transition-step-service";

export const getPlaybackNativeFailureAction = (
  error: string,
): PlaybackAction => ({
  error,
  type: "native-failure",
});

export const getPlaybackNativeStatusAction = ({
  premiumActive,
  status,
}: {
  premiumActive: boolean;
  status: TrackPlayerStatusSnapshot;
}): PlaybackAction => ({
  premiumActive,
  status,
  type: "native-status",
});

export const getPlaybackNativeFinishedAction = (
  targetIndex: number | null,
): PlaybackAction => ({
  targetIndex,
  type: "native-finished",
});

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
      ...getPlaybackAdStatusUpdate({ state, status }),
    };
  }

  return {
    ...state,
    ...getPlaybackLibraryStatusUpdate({
      premiumActive,
      state,
      status,
    }),
  };
};

export const finishPlaybackNativeTrack = ({
  state,
  targetIndex,
}: {
  state: PlaybackState;
  targetIndex: number | null;
}): PlaybackState => setPlaybackActiveQueueIndex({ index: targetIndex, state });

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
