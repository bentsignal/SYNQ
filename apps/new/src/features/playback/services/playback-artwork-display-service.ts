type PlaybackArtworkPathSet = {
  pathToSmallImage: string;
};

export type PlaybackArtworkPathResolver = (
  imageHash: string,
) => PlaybackArtworkPathSet;

export const getPlaybackDisplayArtworkUriWithResolver = ({
  artworkUri,
  getImagePathFromHash,
}: {
  artworkUri: string | null | undefined;
  getImagePathFromHash: PlaybackArtworkPathResolver;
}) => {
  if (!artworkUri) {
    return null;
  }

  if (
    artworkUri.startsWith("file://") ||
    artworkUri.startsWith("/") ||
    artworkUri.startsWith("http://") ||
    artworkUri.startsWith("https://")
  ) {
    return artworkUri;
  }

  return getImagePathFromHash(artworkUri).pathToSmallImage;
};
