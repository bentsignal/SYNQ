import type { PlaybackState } from "../types/playback-state";
import {
  trackPlaybackAdProgress,
  updatePlaybackAdBreakProgress,
} from "./playback-ad-gate-state-service";
import type { TrackPlayerStatusSnapshot } from "./playback-native-status-service";

export const getPlaybackAdStatusUpdate = ({
  state,
  status,
}: {
  state: PlaybackState;
  status: TrackPlayerStatusSnapshot;
}) => ({
  adGate: updatePlaybackAdBreakProgress({
    duration: status.duration,
    position: status.position,
    state: state.adGate,
  }),
  isPlaying: false,
});

export const getPlaybackLibraryStatusUpdate = ({
  premiumActive,
  state,
  status,
}: {
  premiumActive: boolean;
  state: PlaybackState;
  status: TrackPlayerStatusSnapshot;
}) => ({
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
});
