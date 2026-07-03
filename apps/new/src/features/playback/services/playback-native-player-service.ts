import {
  createAudioPlayer,
  type AudioPlayer,
} from "expo-audio";
import type { PlaybackQueueItem } from "../types/playback-state";
import { playbackAdAudio } from "./playback-native-audio-service";
import {
  getPlaybackNativePlayerPlayAdState,
  getPlaybackNativePlayerPlayLibraryPlan,
  getPlaybackNativePlayerPlayLibraryState,
  getPlaybackNativePlayerRemoveSourceState,
  getPlaybackNativePlayerResumeLibraryState,
  initialPlaybackNativePlayerRegistryState,
} from "./playback-native-player-state-service";
import { createTrackPlayerStatusListenerRegistry } from "./playback-native-status-listener-service";
import type { TrackPlayerStatusSnapshot } from "./playback-native-status-service";

type TrackPlayerStatusListener = (
  status: TrackPlayerStatusSnapshot,
) => void;

export const createPlaybackNativePlayerRegistry = () => {
  let adPlayer: AudioPlayer | null = null;
  let libraryPlayer: AudioPlayer | null = null;
  let registryState = initialPlaybackNativePlayerRegistryState();
  const statusListeners = createTrackPlayerStatusListenerRegistry({
    getLoadedSongId: () => registryState.loadedSongId,
  });

  const removeAdPlayer = () => {
    statusListeners.removeAd();

    if (adPlayer) {
      adPlayer.remove();
      adPlayer = null;
    }

    registryState = getPlaybackNativePlayerRemoveSourceState({
      source: "ad",
      state: registryState,
    });
  };

  const removeLibraryPlayer = () => {
    statusListeners.removeLibrary();

    if (libraryPlayer) {
      libraryPlayer.remove();
      libraryPlayer = null;
    }

    registryState = getPlaybackNativePlayerRemoveSourceState({
      source: "library",
      state: registryState,
    });
  };

  return {
    destroy: async () => {
      removeAdPlayer();
      removeLibraryPlayer();
    },
    pause: async () => {
      if (registryState.activeSource === "ad" && adPlayer) {
        adPlayer.pause();
        return;
      }

      if (libraryPlayer) {
        libraryPlayer.pause();
      }
    },
    playAd: () => {
      if (libraryPlayer) {
        libraryPlayer.pause();
      }

      removeAdPlayer();

      adPlayer = createAudioPlayer(playbackAdAudio);
      registryState = getPlaybackNativePlayerPlayAdState(registryState);
      statusListeners.attach(adPlayer, "ad");
      adPlayer.play();
    },
    playLibrarySong: async (song: PlaybackQueueItem) => {
      if (!song.pathToFile) {
        throw new Error("This song does not have a playable file path.");
      }

      removeAdPlayer();

      const plan = getPlaybackNativePlayerPlayLibraryPlan({
        songId: song.id,
        state: registryState,
      });
      if (libraryPlayer && plan.type === "replay-loaded-song") {
        registryState = getPlaybackNativePlayerPlayLibraryState({
          songId: song.id,
          state: registryState,
        });
        await libraryPlayer.seekTo(0);
        libraryPlayer.play();
        return;
      }

      removeLibraryPlayer();

      libraryPlayer = createAudioPlayer({ uri: song.pathToFile });
      registryState = getPlaybackNativePlayerPlayLibraryState({
        songId: song.id,
        state: registryState,
      });
      statusListeners.attach(libraryPlayer, "library");
      libraryPlayer.play();
    },
    resume: async () => {
      if (registryState.activeSource === "ad" && adPlayer) {
        adPlayer.play();
        return;
      }

      if (libraryPlayer) {
        registryState = getPlaybackNativePlayerResumeLibraryState(registryState);
        libraryPlayer.play();
      }
    },
    resumeLibrary: async () => {
      removeAdPlayer();

      if (libraryPlayer) {
        registryState = getPlaybackNativePlayerResumeLibraryState(registryState);
        libraryPlayer.play();
      }
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
    stop: async () => {
      removeAdPlayer();
      removeLibraryPlayer();
    },
  };
};
