import {
  createAudioPlayer,
  type AudioPlayer,
} from "expo-audio";
import type { PlaybackQueueItem } from "../types/playback-state";
import { playbackAdAudio } from "./playback-native-audio-service";
import { getPlaybackNativeLibraryAudioSource } from "./playback-native-library-source-service";
import {
  getPlaybackNativePlayerPlayAdState,
  getPlaybackNativePlayerPlayLibraryState,
  type PlaybackNativePlayerRegistryState,
} from "./playback-native-player-state-service";
import { getPlaybackNativeLibraryPlaybackTarget } from "./playback-native-player-target-service";
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

export const playPlaybackNativeLibrarySource = async ({
  getRegistryState,
  libraryPlayer,
  removeAdPlayer,
  removeLibraryPlayer,
  setRegistryState,
  song,
  statusListeners,
}: PlaybackNativePlayerPlayDependencies & {
  libraryPlayer: AudioPlayer | null;
  removeAdPlayer: () => void;
  removeLibraryPlayer: () => void;
  song: PlaybackQueueItem;
}) => {
  const source = getPlaybackNativeLibraryAudioSource(song);

  removeAdPlayer();

  const plan = getPlaybackNativeLibraryPlaybackTarget({
    hasLibraryPlayer: Boolean(libraryPlayer),
    songId: song.id,
    state: getRegistryState(),
  });
  if (plan.type === "replay-loaded-song" && libraryPlayer) {
    setRegistryState(
      getPlaybackNativePlayerPlayLibraryState({
        songId: song.id,
        state: getRegistryState(),
      }),
    );
    await libraryPlayer.seekTo(0);
    libraryPlayer.play();
    return libraryPlayer;
  }

  removeLibraryPlayer();

  const nextLibraryPlayer = createAudioPlayer(source);
  setRegistryState(
    getPlaybackNativePlayerPlayLibraryState({
      songId: song.id,
      state: getRegistryState(),
    }),
  );
  statusListeners.attach(nextLibraryPlayer, "library");
  nextLibraryPlayer.play();

  return nextLibraryPlayer;
};

