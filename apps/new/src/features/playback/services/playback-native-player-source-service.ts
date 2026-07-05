import {
  createAudioPlayer,
  type AudioPlayer,
} from "expo-audio";
import type { PlaybackQueueItem } from "../types/playback-state";
import { playbackAdAudio } from "./playback-native-audio-service";
import { getPlaybackNativeLibraryAudioSource } from "./playback-native-library-source-service";
import {
  getPlaybackNativePlayerPlayAdState,
  getPlaybackNativePlayerPlayLibraryState,
  getPlaybackNativePlayerResumeLibraryState,
  type PlaybackNativePlayerRegistryState,
} from "./playback-native-player-state-service";
import { removePlaybackNativePlayerSource } from "./playback-native-player-removal-service";
import {
  getPlaybackNativeLibraryPlaybackTarget,
  getPlaybackNativePlayerControlTarget,
} from "./playback-native-player-target-service";
import { createTrackPlayerStatusListenerRegistry } from "./playback-native-status-listener-service";
import type { TrackPlayerStatusSnapshot } from "./playback-native-status-service";

type TrackPlayerStatusListener = (
  status: TrackPlayerStatusSnapshot,
) => void;

type PlaybackNativePlayerSourceParams = {
  getRegistryState: () => PlaybackNativePlayerRegistryState;
  setRegistryState: (state: PlaybackNativePlayerRegistryState) => void;
};

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
      if (
        getPlaybackNativePlayerControlTarget(getRegistryState()) === "ad" &&
        adPlayer
      ) {
        adPlayer.pause();
        return;
      }

      libraryPlayer?.pause();
    },
    playAd: () => {
      libraryPlayer?.pause();
      removeAdPlayer();

      adPlayer = createAudioPlayer(playbackAdAudio);
      setRegistryState(getPlaybackNativePlayerPlayAdState(getRegistryState()));
      statusListeners.attach(adPlayer, "ad");
      adPlayer.play();
    },
    playLibrarySong: async (song: PlaybackQueueItem) => {
      const source = getPlaybackNativeLibraryAudioSource(song);

      removeAdPlayer();

      const plan = getPlaybackNativeLibraryPlaybackTarget({
        hasLibraryPlayer: Boolean(libraryPlayer),
        songId: song.id,
        state: getRegistryState(),
      });
      if (plan.type === "replay-loaded-song" && libraryPlayer) {
        setRegistryState(
          getPlaybackNativePlayerPlayLibraryState({
            songId: song.id,
            state: getRegistryState(),
          }),
        );
        await libraryPlayer.seekTo(0);
        libraryPlayer.play();
        return;
      }

      removeLibraryPlayer();

      libraryPlayer = createAudioPlayer(source);
      setRegistryState(
        getPlaybackNativePlayerPlayLibraryState({
          songId: song.id,
          state: getRegistryState(),
        }),
      );
      statusListeners.attach(libraryPlayer, "library");
      libraryPlayer.play();
    },
    resumeActive: () => {
      if (
        getPlaybackNativePlayerControlTarget(getRegistryState()) === "ad" &&
        adPlayer
      ) {
        adPlayer.play();
        return;
      }

      if (libraryPlayer) {
        setRegistryState(
          getPlaybackNativePlayerResumeLibraryState(getRegistryState()),
        );
        libraryPlayer.play();
      }
    },
    resumeLibrary: () => {
      removeAdPlayer();

      if (libraryPlayer) {
        setRegistryState(
          getPlaybackNativePlayerResumeLibraryState(getRegistryState()),
        );
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
    stop: () => {
      removeAdPlayer();
      removeLibraryPlayer();
    },
  };
};
