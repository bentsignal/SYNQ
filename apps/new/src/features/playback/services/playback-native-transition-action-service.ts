import type { PlaybackAction } from "./playback-session-action-service";
import type { TrackPlayerStatusSnapshot } from "./playback-native-status-service";

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
