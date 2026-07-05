import type { AudioPlayer } from "expo-audio";
import type { PlaybackQueueItem } from "../types/playback-state";
import {
  pausePlaybackNativeActivePlayer,
  resumePlaybackNativeActivePlayer,
  resumePlaybackNativeLibraryPlayer,
} from "./playback-native-player-control-service";
import {
  playPlaybackNativeAdSource,
  playPlaybackNativeLibrarySource,
} from "./playback-native-player-play-service";
import { seekPlaybackNativeLibraryPlayer } from "./playback-native-player-seek-service";
import { createPlaybackNativePlayerSourceRemovers } from "./playback-native-player-source-removal-service";
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

  const { removeAdPlayer, removeLibraryPlayer } =
    createPlaybackNativePlayerSourceRemovers({
      getPlayer: (source) => (source === "ad" ? adPlayer : libraryPlayer),
      getRegistryState,
      setPlayer: (source, player) => {
        if (source === "ad") {
          adPlayer = player;
          return;
        }

        libraryPlayer = player;
      },
      setRegistryState,
      statusListeners,
    });

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
    seekLibraryTo: (position: number) =>
      seekPlaybackNativeLibraryPlayer({ libraryPlayer, position }),
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
