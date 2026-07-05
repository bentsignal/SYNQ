import type { AudioPlayer } from "expo-audio";
import type { PlaybackQueueItem } from "../types/playback-state";
import {
  pausePlaybackNativeActivePlayer,
  resumePlaybackNativeActivePlayer,
  resumePlaybackNativeLibraryPlayer,
} from "./playback-native-player-control-service";
import { removePlaybackNativePlayerSource } from "./playback-native-player-removal-service";
import {
  playPlaybackNativeAdSource,
  playPlaybackNativeLibrarySource,
} from "./playback-native-player-play-service";
import type {
  PlaybackNativePlayerSourceParams,
  TrackPlayerStatusListener,
} from "./playback-native-player-source-types-service";
import { createTrackPlayerStatusListenerRegistry } from "./playback-native-status-listener-service";

export type {
  PlaybackNativePlayerSourceParams,
  TrackPlayerStatusListener,
} from "./playback-native-player-source-types-service";

export const createPlaybackNativePlayerSources = ({
  getRegistryState,
  setRegistryState,
}: PlaybackNativePlayerSourceParams) => {
  let adPlayer: AudioPlayer | null = null;
  let libraryPlayer: AudioPlayer | null = null;
  const statusListeners = createTrackPlayerStatusListenerRegistry({
    getLoadedSongId: () => getRegistryState().loadedSongId,
  });

  const removeAdPlayer = () => {
    adPlayer = removePlaybackNativePlayerSource({
      getRegistryState,
      player: adPlayer,
      setRegistryState,
      source: "ad",
      statusListeners,
    });
  };

  const removeLibraryPlayer = () => {
    libraryPlayer = removePlaybackNativePlayerSource({
      getRegistryState,
      player: libraryPlayer,
      setRegistryState,
      source: "library",
      statusListeners,
    });
  };

  return {
    pauseActive: () => {
      pausePlaybackNativeActivePlayer({
        adPlayer,
        getRegistryState,
        libraryPlayer,
      });
    },
    playAd: () => {
      adPlayer = playPlaybackNativeAdSource({
        getRegistryState,
        libraryPlayer,
        removeAdPlayer,
        setRegistryState,
        statusListeners,
      });
    },
    playLibrarySong: async (song: PlaybackQueueItem) => {
      libraryPlayer = await playPlaybackNativeLibrarySource({
        getRegistryState,
        libraryPlayer,
        removeAdPlayer,
        removeLibraryPlayer,
        setRegistryState,
        song,
        statusListeners,
      });
    },
    resumeActive: () => {
      resumePlaybackNativeActivePlayer({
        adPlayer,
        getRegistryState,
        libraryPlayer,
        setRegistryState,
      });
    },
    resumeLibrary: () => {
      removeAdPlayer();
      resumePlaybackNativeLibraryPlayer({
        getRegistryState,
        libraryPlayer,
        setRegistryState,
      });
    },
    seekLibraryTo: async (position: number) => {
      if (libraryPlayer) {
        await libraryPlayer.seekTo(position / 1000);
      }
    },
    setStatusListener: (listener: TrackPlayerStatusListener | null) => {
      statusListeners.setListener(listener);

      if (!listener) {
        return;
      }

      statusListeners.attach(libraryPlayer, "library");
      statusListeners.attach(adPlayer, "ad");
    },
    stop: () => {
      removeAdPlayer();
      removeLibraryPlayer();
    },
  };
};
