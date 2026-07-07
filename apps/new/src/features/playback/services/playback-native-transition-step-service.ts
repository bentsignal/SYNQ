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
}) => {
  const nativeActiveTrackId = status.activeTrackId ?? status.songId;
  const nativeActiveQueueIndex =
    nativeActiveTrackId === null
      ? null
      : state.queue.findIndex((track) => track.id === nativeActiveTrackId);
  const nativeActiveTrack =
    nativeActiveQueueIndex === null || nativeActiveQueueIndex < 0
      ? null
      : (state.queue[nativeActiveQueueIndex] ?? null);

  return {
    activeQueueIndex: nativeActiveTrack
      ? nativeActiveQueueIndex
      : state.activeQueueIndex,
    activeTrackId: nativeActiveTrack?.id ?? state.activeTrackId,
    adGate: status.isPlaying
      ? trackPlaybackAdProgress({
          currentPosition: status.position,
          gate: state.adGate,
          premiumActive,
        })
      : state.adGate,
    duration:
      status.duration ?? nativeActiveTrack?.duration ?? state.duration,
    isPlaying: status.isPlaying,
    position: Math.max(0, status.position),
  };
};
