import type { AudioPlayer } from "expo-audio";
import {
  pausePlaybackNativeActivePlayer,
  resumePlaybackNativeActivePlayer,
  resumePlaybackNativeLibraryPlayer,
} from "./playback-native-player-control-service";
import { seekPlaybackNativeLibraryPlayer } from "./playback-native-player-seek-service";
import type {
  PlaybackNativePlayerRegistryState,
} from "./playback-native-player-state-service";

type PlaybackNativePlayerControlPlayers = {
  getAdPlayer: () => AudioPlayer | null;
  getLibraryPlayer: () => AudioPlayer | null;
};

export const createPlaybackNativePlayerControlCommands = ({
  getAdPlayer,
  getLibraryPlayer,
  getRegistryState,
  removeAdPlayer,
  removeLibraryPlayer,
  setRegistryState,
}: PlaybackNativePlayerControlPlayers & {
  getRegistryState: () => PlaybackNativePlayerRegistryState;
  removeAdPlayer: () => void;
  removeLibraryPlayer: () => void;
  setRegistryState: (state: PlaybackNativePlayerRegistryState) => void;
}) => ({
  pauseActive: () => {
    pausePlaybackNativeActivePlayer({
      adPlayer: getAdPlayer(),
      getRegistryState,
      libraryPlayer: getLibraryPlayer(),
    });
  },
  resumeActive: () => {
    resumePlaybackNativeActivePlayer({
      adPlayer: getAdPlayer(),
      getRegistryState,
      libraryPlayer: getLibraryPlayer(),
      setRegistryState,
    });
  },
  resumeLibrary: () => {
    removeAdPlayer();
    resumePlaybackNativeLibraryPlayer({
      getRegistryState,
      libraryPlayer: getLibraryPlayer(),
      setRegistryState,
    });
  },
  seekLibraryTo: (position: number) =>
    seekPlaybackNativeLibraryPlayer({
      libraryPlayer: getLibraryPlayer(),
      position,
    }),
  stop: () => {
    removeAdPlayer();
    removeLibraryPlayer();
  },
});
