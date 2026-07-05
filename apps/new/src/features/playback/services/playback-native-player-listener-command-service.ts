import type { AudioPlayer } from "expo-audio";
import type {
  TrackPlayerStatusListener,
} from "./playback-native-player-source-types-service";
import type { createTrackPlayerStatusListenerRegistry } from "./playback-native-status-listener-service";

type PlaybackNativePlayerStatusListeners = ReturnType<
  typeof createTrackPlayerStatusListenerRegistry
>;

export const setPlaybackNativePlayerStatusListener = ({
  adPlayer,
  libraryPlayer,
  listener,
  statusListeners,
}: {
  adPlayer: AudioPlayer | null;
  libraryPlayer: AudioPlayer | null;
  listener: TrackPlayerStatusListener | null;
  statusListeners: PlaybackNativePlayerStatusListeners;
}) => {
  statusListeners.setListener(listener);

  if (!listener) {
    return;
  }

  statusListeners.attach(libraryPlayer, "library");
  statusListeners.attach(adPlayer, "ad");
};
