import type { AudioPlayer } from "expo-audio";
import type { TrackPlayerSource } from "./playback-native-status-service";

export const createPlaybackNativePlayerRefs = () => {
  let adPlayer: AudioPlayer | null = null;
  let libraryPlayer: AudioPlayer | null = null;

  return {
    getAdPlayer: () => adPlayer,
    getLibraryPlayer: () => libraryPlayer,
    getPlayer: (source: TrackPlayerSource) =>
      source === "ad" ? adPlayer : libraryPlayer,
    setAdPlayer: (player: AudioPlayer | null) => {
      adPlayer = player;
    },
    setLibraryPlayer: (player: AudioPlayer | null) => {
      libraryPlayer = player;
    },
    setPlayer: (source: TrackPlayerSource, player: AudioPlayer | null) => {
      if (source === "ad") {
        adPlayer = player;
        return;
      }

      libraryPlayer = player;
    },
  };
};
