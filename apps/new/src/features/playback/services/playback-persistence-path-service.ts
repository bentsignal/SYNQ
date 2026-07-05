export type PlaybackPersistencePathDependencies = {
  documentDirectory: string | null;
};

const playbackStateDirectoryName = "playback";
const playbackStateFileName = "session.json";

export const getPlaybackStateDirectoryWithDependencies = ({
  documentDirectory,
}: PlaybackPersistencePathDependencies) => {
  if (!documentDirectory) {
    throw new Error("The document directory is not available.");
  }

  return `${documentDirectory}${playbackStateDirectoryName}`;
};

export const getPlaybackStateFileWithDependencies = (
  dependencies: PlaybackPersistencePathDependencies,
) =>
  `${getPlaybackStateDirectoryWithDependencies(
    dependencies,
  )}/${playbackStateFileName}`;
