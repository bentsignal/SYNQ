import type { AudioPlayer } from "expo-audio";
import { removePlaybackNativePlayerSource } from "./playback-native-player-removal-service";
import type {
  PlaybackNativePlayerRegistryState,
} from "./playback-native-player-state-service";
import type { TrackPlayerSource } from "./playback-native-status-service";

type PlaybackNativeStatusListenerRemovers = {
  removeAd: () => void;
  removeLibrary: () => void;
};

type PlaybackNativePlayerGetter = (
  source: TrackPlayerSource,
) => AudioPlayer | null;

type PlaybackNativePlayerSetter = (
  source: TrackPlayerSource,
  player: AudioPlayer | null,
) => void;

const removePlaybackNativeSource = ({
  getPlayer,
  getRegistryState,
  setPlayer,
  setRegistryState,
  source,
  statusListeners,
}: {
  getPlayer: PlaybackNativePlayerGetter;
  getRegistryState: () => PlaybackNativePlayerRegistryState;
  setPlayer: PlaybackNativePlayerSetter;
  setRegistryState: (state: PlaybackNativePlayerRegistryState) => void;
  source: TrackPlayerSource;
  statusListeners: PlaybackNativeStatusListenerRemovers;
}) => {
  setPlayer(
    source,
    removePlaybackNativePlayerSource({
      getRegistryState,
      player: getPlayer(source),
      setRegistryState,
      source,
      statusListeners,
    }),
  );
};

export const createPlaybackNativePlayerSourceRemovers = ({
  getPlayer,
  getRegistryState,
  setPlayer,
  setRegistryState,
  statusListeners,
}: {
  getPlayer: PlaybackNativePlayerGetter;
  getRegistryState: () => PlaybackNativePlayerRegistryState;
  setPlayer: PlaybackNativePlayerSetter;
  setRegistryState: (state: PlaybackNativePlayerRegistryState) => void;
  statusListeners: PlaybackNativeStatusListenerRemovers;
}) => ({
  removeAdPlayer: () => {
    removePlaybackNativeSource({
      getPlayer,
      getRegistryState,
      setPlayer,
      setRegistryState,
      source: "ad",
      statusListeners,
    });
  },
  removeLibraryPlayer: () => {
    removePlaybackNativeSource({
      getPlayer,
      getRegistryState,
      setPlayer,
      setRegistryState,
      source: "library",
      statusListeners,
    });
  },
});
