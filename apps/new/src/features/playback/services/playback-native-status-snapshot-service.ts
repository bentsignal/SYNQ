import type { PlaybackState as SynqPlaybackState } from "@synq/native-audio";

import type { TrackPlayerStatusSnapshot } from "./playback-native-status-service";

type PlaybackNativeSource = "ad" | "library" | null;

const getFiniteTrackId = (trackId: string | undefined): number | null => {
  if (!trackId) {
    return null;
  }

  const parsedTrackId = Number(trackId);

  return Number.isFinite(parsedTrackId) ? parsedTrackId : null;
};

export const getTrackPlayerStatusSnapshotFromNativeState = ({
  source,
  state,
}: {
  source: PlaybackNativeSource;
  state: SynqPlaybackState;
}): TrackPlayerStatusSnapshot => {
  const duration = Number.isFinite(state.durationMs)
    ? Math.max(0, state.durationMs)
    : (state.activeTrack?.durationMs ?? 0);
  const position = Number.isFinite(state.positionMs)
    ? Math.max(0, state.positionMs)
    : 0;
  const activeTrackId =
    source === "library" && state.activeTrack
      ? getFiniteTrackId(state.activeTrack.id)
      : null;

  return {
    activeTrackId,
    didJustFinish: state.status === "ended",
    duration: duration || null,
    isLoaded: Boolean(state.activeTrack),
    isPlaying: state.status === "playing" || state.status === "buffering",
    position,
    songId: activeTrackId,
    source,
  };
};
