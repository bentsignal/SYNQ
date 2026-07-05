import type {
  PlaybackNativePlayerRegistryState,
} from "./playback-native-player-state-service";
import type {
  TrackPlayerStatusSnapshot,
} from "./playback-native-status-service";

export type TrackPlayerStatusListener = (
  status: TrackPlayerStatusSnapshot,
) => void;

export type PlaybackNativePlayerSourceParams = {
  getRegistryState: () => PlaybackNativePlayerRegistryState;
  setRegistryState: (state: PlaybackNativePlayerRegistryState) => void;
};
