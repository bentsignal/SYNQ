import type { AudioPlayer } from "expo-audio";
import {
  getPlaybackNativePlayerResumeLibraryState,
  type PlaybackNativePlayerRegistryState,
} from "./playback-native-player-state-service";
import { getPlaybackNativePlayerControlTarget } from "./playback-native-player-target-service";

export const pausePlaybackNativeActivePlayer = ({
  adPlayer,
  getRegistryState,
  libraryPlayer,
}: {
  adPlayer: AudioPlayer | null;
  getRegistryState: () => PlaybackNativePlayerRegistryState;
  libraryPlayer: AudioPlayer | null;
}) => {
  if (
    getPlaybackNativePlayerControlTarget(getRegistryState()) === "ad" &&
    adPlayer
  ) {
    adPlayer.pause();
    return;
  }

  libraryPlayer?.pause();
};

export const resumePlaybackNativeActivePlayer = ({
  adPlayer,
  getRegistryState,
  libraryPlayer,
  setRegistryState,
}: {
  adPlayer: AudioPlayer | null;
  getRegistryState: () => PlaybackNativePlayerRegistryState;
  libraryPlayer: AudioPlayer | null;
  setRegistryState: (state: PlaybackNativePlayerRegistryState) => void;
}) => {
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
};

export const resumePlaybackNativeLibraryPlayer = ({
  getRegistryState,
  libraryPlayer,
  setRegistryState,
}: {
  getRegistryState: () => PlaybackNativePlayerRegistryState;
  libraryPlayer: AudioPlayer | null;
  setRegistryState: (state: PlaybackNativePlayerRegistryState) => void;
}) => {
  if (libraryPlayer) {
    setRegistryState(
      getPlaybackNativePlayerResumeLibraryState(getRegistryState()),
    );
    libraryPlayer.play();
  }
};
