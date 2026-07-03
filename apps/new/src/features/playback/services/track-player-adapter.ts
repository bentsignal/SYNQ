import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";
import { configurePlaybackAudio } from "./playback-native-audio-service";
import { createPlaybackNativePlayerRegistry } from "./playback-native-player-service";
import type { TrackPlayerStatusSnapshot } from "./playback-native-status-service";

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

export const createExpoAudioTrackPlayerAdapter = (): TrackPlayerAdapter => {
  const playerRegistry = createPlaybackNativePlayerRegistry();

  const playSong = async (song: PlaybackQueueItem) => {
    await configurePlaybackAudio();
    await playerRegistry.playLibrarySong(song);
  };

  const playAd = async () => {
    await configurePlaybackAudio();
    playerRegistry.playAd();
  };

  return {
    destroy: playerRegistry.destroy,
    pause: playerRegistry.pause,
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
    resume: playerRegistry.resume,
    resumeLibrary: playerRegistry.resumeLibrary,
    seekTo: playerRegistry.seekLibraryTo,
    setStatusListener: playerRegistry.setStatusListener,
    stop: playerRegistry.stop,
  };
};
