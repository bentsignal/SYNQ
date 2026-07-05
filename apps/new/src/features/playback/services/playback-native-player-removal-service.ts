import type { AudioPlayer } from "expo-audio";
import {
  getPlaybackNativePlayerRemoveSourceState,
  type PlaybackNativePlayerRegistryState,
} from "./playback-native-player-state-service";
import type { TrackPlayerSource } from "./playback-native-status-service";

type PlaybackNativeStatusListenerRemovers = {
  removeAd: () => void;
  removeLibrary: () => void;
};

export const removePlaybackNativePlayerSource = ({
  getRegistryState,
  player,
  setRegistryState,
  source,
  statusListeners,
}: {
  getRegistryState: () => PlaybackNativePlayerRegistryState;
  player: AudioPlayer | null;
  setRegistryState: (state: PlaybackNativePlayerRegistryState) => void;
  source: TrackPlayerSource;
  statusListeners: PlaybackNativeStatusListenerRemovers;
}): null => {
  if (source === "ad") {
    statusListeners.removeAd();
  } else {
    statusListeners.removeLibrary();
  }

  player?.remove();

  setRegistryState(
    getPlaybackNativePlayerRemoveSourceState({
      source,
      state: getRegistryState(),
    }),
  );

  return null;
};
