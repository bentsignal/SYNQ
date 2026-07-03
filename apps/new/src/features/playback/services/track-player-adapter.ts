import {
  createAudioPlayer,
  PLAYBACK_STATUS_UPDATE,
  type AudioPlayer,
} from "expo-audio";
import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";
import {
  audioStatusToTrackPlayerSnapshot,
  type TrackPlayerSource,
  type TrackPlayerStatusSnapshot,
} from "./playback-native-status-service";
import {
  configurePlaybackAudio,
  playbackAdAudio,
} from "./playback-native-audio-service";

export type TrackPlayerAdapter = {
  destroy: () => Promise<void>;
  pause: () => Promise<void>;
  play: (song: PlaybackQueueItem) => Promise<void>;
  playAd: () => Promise<void>;
  restore: (state: PlaybackState) => Promise<void>;
  resume: () => Promise<void>;
  resumeLibrary: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  setStatusListener: (
    listener: ((status: TrackPlayerStatusSnapshot) => void) | null,
  ) => void;
  stop: () => Promise<void>;
};

export const createUnavailableTrackPlayerAdapter = (): TrackPlayerAdapter => ({
  destroy: () => Promise.resolve(),
  pause: () => Promise.resolve(),
  play: () => Promise.resolve(),
  playAd: () => Promise.resolve(),
  restore: () => Promise.resolve(),
  resume: () => Promise.resolve(),
  resumeLibrary: () => Promise.resolve(),
  seekTo: () => Promise.resolve(),
  setStatusListener: () => {},
  stop: () => Promise.resolve(),
});

type AudioPlayerSubscription = ReturnType<AudioPlayer["addListener"]>;

export const createExpoAudioTrackPlayerAdapter = (): TrackPlayerAdapter => {
  let adPlayer: AudioPlayer | null = null;
  let adStatusSubscription: AudioPlayerSubscription | null = null;
  let libraryPlayer: AudioPlayer | null = null;
  let libraryStatusSubscription: AudioPlayerSubscription | null = null;
  let loadedSongId: number | null = null;
  let activeSource: TrackPlayerSource | null = null;
  let statusListener: ((status: TrackPlayerStatusSnapshot) => void) | null =
    null;

  const attachStatusListener = (
    player: AudioPlayer | null,
    source: TrackPlayerSource,
  ) => {
    const subscription = player?.addListener(PLAYBACK_STATUS_UPDATE, (status) => {
      statusListener?.(
        audioStatusToTrackPlayerSnapshot({
          loadedSongId,
          source,
          status,
        }),
      );
    });

    if (source === "ad") {
      adStatusSubscription?.remove();
      adStatusSubscription = subscription ?? null;
      return;
    }

    libraryStatusSubscription?.remove();
    libraryStatusSubscription = subscription ?? null;
  };

  const removeStatusListeners = () => {
    adStatusSubscription?.remove();
    adStatusSubscription = null;
    libraryStatusSubscription?.remove();
    libraryStatusSubscription = null;
  };

  const removeAdPlayer = () => {
    adStatusSubscription?.remove();
    adStatusSubscription = null;

    if (adPlayer) {
      adPlayer.remove();
      adPlayer = null;
    }

    if (activeSource === "ad") {
      activeSource = null;
    }
  };

  const removeLibraryPlayer = () => {
    libraryStatusSubscription?.remove();
    libraryStatusSubscription = null;

    if (libraryPlayer) {
      libraryPlayer.remove();
      libraryPlayer = null;
      loadedSongId = null;
    }

    if (activeSource === "library") {
      activeSource = null;
    }
  };

  const unloadAllSounds = async () => {
    removeAdPlayer();
    removeLibraryPlayer();
  };

  const playSong = async (song: PlaybackQueueItem) => {
    if (!song.pathToFile) {
      throw new Error("This song does not have a playable file path.");
    }

    await configurePlaybackAudio();
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
    attachStatusListener(libraryPlayer, "library");
    libraryPlayer.play();
  };

  const playAd = async () => {
    await configurePlaybackAudio();

    if (libraryPlayer) {
      libraryPlayer.pause();
    }

    removeAdPlayer();

    adPlayer = createAudioPlayer(playbackAdAudio);
    activeSource = "ad";
    attachStatusListener(adPlayer, "ad");
    adPlayer.play();
  };

  const resumeLibrary = async () => {
    removeAdPlayer();

    if (libraryPlayer) {
      activeSource = "library";
      libraryPlayer.play();
    }
  };

  return {
    destroy: unloadAllSounds,
    pause: async () => {
      if (activeSource === "ad" && adPlayer) {
        adPlayer.pause();
        return;
      }

      if (libraryPlayer) {
        libraryPlayer.pause();
      }
    },
    play: playSong,
    playAd,
    restore: async (state) => {
      const activeSong =
        state.activeQueueIndex === null
          ? null
          : state.queue[state.activeQueueIndex] ?? null;

      if (activeSong && state.isPlaying) {
        await playSong(activeSong);
      }
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
    resumeLibrary,
    seekTo: async (position) => {
      if (libraryPlayer) {
        await libraryPlayer.seekTo(position / 1000);
      }
    },
    setStatusListener: (listener) => {
      statusListener = listener;

      if (!listener) {
        removeStatusListeners();
        return;
      }

      attachStatusListener(libraryPlayer, "library");
      attachStatusListener(adPlayer, "ad");
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
