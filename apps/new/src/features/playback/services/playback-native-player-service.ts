import {
  createAudioPlayer,
  type AudioPlayer,
} from "expo-audio";
import type { PlaybackQueueItem } from "../types/playback-state";
import { playbackAdAudio } from "./playback-native-audio-service";
import { createTrackPlayerStatusListenerRegistry } from "./playback-native-status-listener-service";
import type {
  TrackPlayerSource,
  TrackPlayerStatusSnapshot,
} from "./playback-native-status-service";

type TrackPlayerStatusListener = (
  status: TrackPlayerStatusSnapshot,
) => void;

export const createPlaybackNativePlayerRegistry = () => {
  let adPlayer: AudioPlayer | null = null;
  let libraryPlayer: AudioPlayer | null = null;
  let loadedSongId: number | null = null;
  let activeSource: TrackPlayerSource | null = null;
  const statusListeners = createTrackPlayerStatusListenerRegistry({
    getLoadedSongId: () => loadedSongId,
  });

  const removeAdPlayer = () => {
    statusListeners.removeAd();

    if (adPlayer) {
      adPlayer.remove();
      adPlayer = null;
    }

    if (activeSource === "ad") {
      activeSource = null;
    }
  };

  const removeLibraryPlayer = () => {
    statusListeners.removeLibrary();

    if (libraryPlayer) {
      libraryPlayer.remove();
      libraryPlayer = null;
      loadedSongId = null;
    }

    if (activeSource === "library") {
      activeSource = null;
    }
  };

  return {
    destroy: async () => {
      removeAdPlayer();
      removeLibraryPlayer();
    },
    pause: async () => {
      if (activeSource === "ad" && adPlayer) {
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
      activeSource = "ad";
      statusListeners.attach(adPlayer, "ad");
      adPlayer.play();
    },
    playLibrarySong: async (song: PlaybackQueueItem) => {
      if (!song.pathToFile) {
        throw new Error("This song does not have a playable file path.");
      }

      removeAdPlayer();

      if (libraryPlayer && loadedSongId === song.id) {
        activeSource = "library";
        await libraryPlayer.seekTo(0);
        libraryPlayer.play();
        return;
      }

      removeLibraryPlayer();

      libraryPlayer = createAudioPlayer({ uri: song.pathToFile });
      loadedSongId = song.id;
      activeSource = "library";
      statusListeners.attach(libraryPlayer, "library");
      libraryPlayer.play();
    },
    resume: async () => {
      if (activeSource === "ad" && adPlayer) {
        adPlayer.play();
        return;
      }

      if (libraryPlayer) {
        activeSource = "library";
        libraryPlayer.play();
      }
    },
    resumeLibrary: async () => {
      removeAdPlayer();

      if (libraryPlayer) {
        activeSource = "library";
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
      if (adPlayer) {
        adPlayer.pause();
        await adPlayer.seekTo(0);
      }

      if (libraryPlayer) {
        libraryPlayer.pause();
        await libraryPlayer.seekTo(0);
      }

      activeSource = null;
    },
  };
};
