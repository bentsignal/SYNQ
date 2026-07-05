import {
  getPlaybackNativePlayerPlayLibraryPlan,
  type PlaybackNativeLibraryPlayPlan,
  type PlaybackNativePlayerRegistryState,
} from "./playback-native-player-state-service";
import type { TrackPlayerSource } from "./playback-native-status-service";

export const getPlaybackNativePlayerControlTarget = (
  state: PlaybackNativePlayerRegistryState,
): TrackPlayerSource => (state.activeSource === "ad" ? "ad" : "library");

export const getPlaybackNativeLibraryPlaybackTarget = ({
  hasLibraryPlayer,
  songId,
  state,
}: {
  hasLibraryPlayer: boolean;
  songId: number;
  state: PlaybackNativePlayerRegistryState;
}): PlaybackNativeLibraryPlayPlan => {
  const plan = getPlaybackNativePlayerPlayLibraryPlan({ songId, state });

  if (hasLibraryPlayer && plan.type === "replay-loaded-song") {
    return plan;
  }

  return { type: "replace-library-player" };
};
