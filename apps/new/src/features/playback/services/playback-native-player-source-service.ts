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
import { createPlaybackNativePlayerRefs } from "./playback-native-player-ref-service";
import { createTrackPlayerStatusListenerRegistry } from "./playback-native-status-listener-service";

export type {
  PlaybackNativePlayerSourceParams,
  TrackPlayerStatusListener,
} from "./playback-native-player-source-types-service";

export const createPlaybackNativePlayerSources = ({
  getRegistryState,
  setRegistryState,
}: PlaybackNativePlayerSourceParams) => {
  const playerRefs = createPlaybackNativePlayerRefs();
  const statusListeners = createTrackPlayerStatusListenerRegistry({
    getLoadedSongId: () => getRegistryState().loadedSongId,
  });

  const { removeAdPlayer, removeLibraryPlayer } =
    createPlaybackNativePlayerSourceRemovers({
      getPlayer: playerRefs.getPlayer,
      getRegistryState,
      setPlayer: playerRefs.setPlayer,
      setRegistryState,
      statusListeners,
    });

  const controlCommands = createPlaybackNativePlayerControlCommands({
    getAdPlayer: playerRefs.getAdPlayer,
    getLibraryPlayer: playerRefs.getLibraryPlayer,
    getRegistryState,
    removeAdPlayer,
    removeLibraryPlayer,
    setRegistryState,
  });

  return {
    pauseActive: controlCommands.pauseActive,
    playAd: () => {
      playerRefs.setAdPlayer(
        playPlaybackNativeAdSource({
          getRegistryState,
          libraryPlayer: playerRefs.getLibraryPlayer(),
          removeAdPlayer,
          setRegistryState,
          statusListeners,
        }),
      );
    },
    playLibrarySong: async (song: PlaybackQueueItem) => {
      playerRefs.setLibraryPlayer(
        await playPlaybackNativeLibrarySource({
          getRegistryState,
          libraryPlayer: playerRefs.getLibraryPlayer(),
          removeAdPlayer,
          removeLibraryPlayer,
          setRegistryState,
          song,
          statusListeners,
        }),
      );
    },
    resumeActive: controlCommands.resumeActive,
    resumeLibrary: controlCommands.resumeLibrary,
    seekLibraryTo: controlCommands.seekLibraryTo,
    setStatusListener: (listener: TrackPlayerStatusListener | null) => {
      setPlaybackNativePlayerStatusListener({
        adPlayer: playerRefs.getAdPlayer(),
        libraryPlayer: playerRefs.getLibraryPlayer(),
        listener,
        statusListeners,
      });
    },
    stop: controlCommands.stop,
  };
};
