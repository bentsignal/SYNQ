import {
  createAudioPlayer,
  type AudioPlayer,
} from "expo-audio";
import { playbackAdAudio } from "./playback-native-audio-service";
import {
  getPlaybackNativePlayerPlayAdState,
  type PlaybackNativePlayerRegistryState,
} from "./playback-native-player-state-service";
import type { createTrackPlayerStatusListenerRegistry } from "./playback-native-status-listener-service";

type PlaybackNativePlayerStatusListeners = ReturnType<
  typeof createTrackPlayerStatusListenerRegistry
>;

type PlaybackNativePlayerPlayDependencies = {
  getRegistryState: () => PlaybackNativePlayerRegistryState;
  setRegistryState: (state: PlaybackNativePlayerRegistryState) => void;
  statusListeners: PlaybackNativePlayerStatusListeners;
};

export const playPlaybackNativeAdSource = ({
  getRegistryState,
  libraryPlayer,
  removeAdPlayer,
  setRegistryState,
  statusListeners,
}: PlaybackNativePlayerPlayDependencies & {
  libraryPlayer: AudioPlayer | null;
  removeAdPlayer: () => void;
}) => {
  libraryPlayer?.pause();
  removeAdPlayer();

  const adPlayer = createAudioPlayer(playbackAdAudio);
  setRegistryState(getPlaybackNativePlayerPlayAdState(getRegistryState()));
  statusListeners.attach(adPlayer, "ad");
  adPlayer.play();

  return adPlayer;
};
