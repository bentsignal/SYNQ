import { Audio, type AVPlaybackStatus } from "expo-av";
import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";

const playbackAdAudio = require("../../../assets/audio/ad.mp3") as number;

type TrackPlayerSource = "ad" | "library";

export type TrackPlayerStatusSnapshot = {
  didJustFinish: boolean;
  duration: number | null;
  isLoaded: boolean;
  isPlaying: boolean;
  position: number;
  songId: number | null;
  source: TrackPlayerSource | null;
};

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

export const createExpoAvTrackPlayerAdapter = (): TrackPlayerAdapter => {
  let adSound: Audio.Sound | null = null;
  let librarySound: Audio.Sound | null = null;
  let loadedSongId: number | null = null;
  let activeSource: TrackPlayerSource | null = null;
  let statusListener: ((status: TrackPlayerStatusSnapshot) => void) | null =
    null;

  const toStatusSnapshot = (
    status: AVPlaybackStatus,
    source: TrackPlayerSource,
  ): TrackPlayerStatusSnapshot => {
    if (!status.isLoaded) {
      return {
        didJustFinish: false,
        duration: null,
        isLoaded: false,
        isPlaying: false,
        position: 0,
        songId: loadedSongId,
        source,
      };
    }

    return {
      didJustFinish: status.didJustFinish,
      duration: status.durationMillis ?? null,
      isLoaded: true,
      isPlaying: status.isPlaying,
      position: status.positionMillis,
      songId: loadedSongId,
      source,
    };
  };

  const attachStatusListener = (
    sound: Audio.Sound | null,
    source: TrackPlayerSource,
  ) => {
    sound?.setOnPlaybackStatusUpdate((status) => {
      statusListener?.(toStatusSnapshot(status, source));
    });
  };

  const configureAudio = async () => {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeAndroid: 1,
      interruptionModeIOS: 1,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      staysActiveInBackground: true,
    });
  };

  const unloadAdSound = async () => {
    if (adSound) {
      await adSound.unloadAsync();
      adSound = null;
    }

    if (activeSource === "ad") {
      activeSource = null;
    }
  };

  const unloadLibrarySound = async () => {
    if (librarySound) {
      await librarySound.unloadAsync();
      librarySound = null;
      loadedSongId = null;
    }

    if (activeSource === "library") {
      activeSource = null;
    }
  };

  const unloadAllSounds = async () => {
    await unloadAdSound();
    await unloadLibrarySound();
  };

  const playSong = async (song: PlaybackQueueItem) => {
    if (!song.pathToFile) {
      throw new Error("This song does not have a playable file path.");
    }

    await configureAudio();
    await unloadAdSound();

    if (librarySound && loadedSongId === song.id) {
      activeSource = "library";
      await librarySound.replayAsync();
      return;
    }

    await unloadLibrarySound();

    const created = await Audio.Sound.createAsync(
      { uri: song.pathToFile },
      {
        positionMillis: 0,
        shouldPlay: true,
      },
    );

    librarySound = created.sound;
    loadedSongId = song.id;
    activeSource = "library";
    attachStatusListener(librarySound, "library");
  };

  const playAd = async () => {
    await configureAudio();

    if (librarySound) {
      await librarySound.pauseAsync();
    }

    await unloadAdSound();

    const created = await Audio.Sound.createAsync(playbackAdAudio, {
      positionMillis: 0,
      shouldPlay: true,
    });

    adSound = created.sound;
    activeSource = "ad";
    attachStatusListener(adSound, "ad");
  };

  const resumeLibrary = async () => {
    await unloadAdSound();

    if (librarySound) {
      activeSource = "library";
      await librarySound.playAsync();
    }
  };

  return {
    destroy: unloadAllSounds,
    pause: async () => {
      if (activeSource === "ad" && adSound) {
        await adSound.pauseAsync();
        return;
      }

      if (librarySound) {
        await librarySound.pauseAsync();
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
      if (activeSource === "ad" && adSound) {
        await adSound.playAsync();
        return;
      }

      if (librarySound) {
        activeSource = "library";
        await librarySound.playAsync();
      }
    },
    resumeLibrary,
    seekTo: async (position) => {
      if (librarySound) {
        await librarySound.setPositionAsync(position);
      }
    },
    setStatusListener: (listener) => {
      statusListener = listener;
      attachStatusListener(librarySound, "library");
      attachStatusListener(adSound, "ad");
    },
    stop: async () => {
      if (adSound) {
        await adSound.stopAsync();
      }

      if (librarySound) {
        await librarySound.stopAsync();
      }
      activeSource = null;
    },
  };
};
