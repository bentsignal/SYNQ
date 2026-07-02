import { Audio } from "expo-av";
import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";

export type TrackPlayerAdapter = {
  destroy: () => Promise<void>;
  pause: () => Promise<void>;
  play: (song: PlaybackQueueItem) => Promise<void>;
  restore: (state: PlaybackState) => Promise<void>;
  resume: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  stop: () => Promise<void>;
};

export const createUnavailableTrackPlayerAdapter = (): TrackPlayerAdapter => ({
  destroy: () => Promise.resolve(),
  pause: () => Promise.resolve(),
  play: () => Promise.resolve(),
  restore: () => Promise.resolve(),
  resume: () => Promise.resolve(),
  seekTo: () => Promise.resolve(),
  stop: () => Promise.resolve(),
});

export const createExpoAvTrackPlayerAdapter = (): TrackPlayerAdapter => {
  let sound: Audio.Sound | null = null;
  let loadedSongId: number | null = null;

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

  const unloadCurrentSound = async () => {
    if (sound) {
      await sound.unloadAsync();
      sound = null;
      loadedSongId = null;
    }
  };

  const playSong = async (song: PlaybackQueueItem) => {
    if (!song.pathToFile) {
      throw new Error("This song does not have a playable file path.");
    }

    await configureAudio();

    if (sound && loadedSongId === song.id) {
      await sound.replayAsync();
      return;
    }

    await unloadCurrentSound();

    const created = await Audio.Sound.createAsync(
      { uri: song.pathToFile },
      {
        positionMillis: 0,
        shouldPlay: true,
      },
    );

    sound = created.sound;
    loadedSongId = song.id;
  };

  return {
    destroy: unloadCurrentSound,
    pause: async () => {
      if (sound) {
        await sound.pauseAsync();
      }
    },
    play: playSong,
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
      if (sound) {
        await sound.playAsync();
      }
    },
    seekTo: async (position) => {
      if (sound) {
        await sound.setPositionAsync(position);
      }
    },
    stop: async () => {
      if (sound) {
        await sound.stopAsync();
      }
    },
  };
};
