export type PlaybackNativeLibrarySourceSong = {
  id: number;
  pathToFile?: string | null;
};

export const getPlaybackNativeLibraryAudioSource = (
  song: PlaybackNativeLibrarySourceSong,
) => {
  if (!song.pathToFile) {
    throw new Error("This song does not have a playable file path.");
  }

  return { uri: song.pathToFile };
};
