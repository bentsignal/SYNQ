import type { AudioPlayer } from "expo-audio";
import type { PlaybackQueueItem } from "../types/playback-state";
import { setPlaybackNativePlayerStatusListener } from "./playback-native-player-listener-command-service";
import { createPlaybackNativePlayerControlCommands } from "./playback-native-player-control-command-service";
import {
  playPlaybackNativeAdSource,
  playPlaybackNativeLibrarySource,
} from "./playback-native-player-play-service";
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

  const controlCommands = createPlaybackNativePlayerControlCommands({
    getAdPlayer: () => adPlayer,
    getLibraryPlayer: () => libraryPlayer,
    getRegistryState,
    removeAdPlayer,
    removeLibraryPlayer,
    setRegistryState,
  });

  return {
    pauseActive: controlCommands.pauseActive,
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
    resumeActive: controlCommands.resumeActive,
    resumeLibrary: controlCommands.resumeLibrary,
    seekLibraryTo: controlCommands.seekLibraryTo,
    setStatusListener: (listener: TrackPlayerStatusListener | null) => {
      setPlaybackNativePlayerStatusListener({
        adPlayer,
        libraryPlayer,
        listener,
        statusListeners,
      });
    },
    stop: controlCommands.stop,
  };
};
