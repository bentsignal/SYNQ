import type { TrackPlayerSource } from "./playback-native-status-service";

export type PlaybackNativeLibrarySourceSong = {
  id: number;
  pathToFile?: string | null;
};

export type PlaybackNativePlayerRegistryState = {
  activeSource: TrackPlayerSource | null;
  loadedSongId: number | null;
};

export type PlaybackNativeLibraryPlayPlan =
  | { type: "replay-loaded-song" }
  | { type: "replace-library-player" };

export const initialPlaybackNativePlayerRegistryState =
  (): PlaybackNativePlayerRegistryState => ({
    activeSource: null,
    loadedSongId: null,
  });

export const getPlaybackNativePlayerRemoveSourceState = ({
  source,
  state,
}: {
  source: TrackPlayerSource;
  state: PlaybackNativePlayerRegistryState;
}): PlaybackNativePlayerRegistryState => ({
  activeSource: state.activeSource === source ? null : state.activeSource,
  loadedSongId: source === "library" ? null : state.loadedSongId,
});

export const getPlaybackNativePlayerPlayAdState = (
  state: PlaybackNativePlayerRegistryState,
): PlaybackNativePlayerRegistryState => ({
  ...getPlaybackNativePlayerRemoveSourceState({ source: "ad", state }),
  activeSource: "ad",
});

export const getPlaybackNativePlayerPlayLibraryPlan = ({
  songId,
  state,
}: {
  songId: number;
  state: PlaybackNativePlayerRegistryState;
}): PlaybackNativeLibraryPlayPlan =>
  state.loadedSongId === songId
    ? { type: "replay-loaded-song" }
    : { type: "replace-library-player" };

export const getPlaybackNativePlayerPlayLibraryState = ({
  songId,
  state,
}: {
  songId: number;
  state: PlaybackNativePlayerRegistryState;
}): PlaybackNativePlayerRegistryState => ({
  ...getPlaybackNativePlayerRemoveSourceState({ source: "ad", state }),
  activeSource: "library",
  loadedSongId: songId,
});

export const getPlaybackNativePlayerResumeLibraryState = (
  state: PlaybackNativePlayerRegistryState,
): PlaybackNativePlayerRegistryState => ({
  ...getPlaybackNativePlayerRemoveSourceState({ source: "ad", state }),
  activeSource: "library",
});

export const getPlaybackNativeLibraryAudioSource = (
  song: PlaybackNativeLibrarySourceSong,
) => {
  if (!song.pathToFile) {
    throw new Error("This song does not have a playable file path.");
  }

  return { uri: song.pathToFile };
};
