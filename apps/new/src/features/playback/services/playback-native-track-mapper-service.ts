import type { PlaybackTrack } from "@synq/native-audio";
import type { ImageStoragePaths } from "../../images/services/image-storage-step-service";
import type { PlaybackQueueItem } from "../types/playback-state";

export const repairPlaybackFileUriWithDocumentDirectory = ({
  documentDirectory,
  uri,
}: {
  documentDirectory: string | null | undefined;
  uri: string | null | undefined;
}) => {
  if (!uri) {
    return "";
  }

  const marker = "/Documents/";
  const markerIndex = uri.indexOf(marker);

  if (markerIndex === -1 || !documentDirectory) {
    return uri;
  }

  const documentRelativePath = uri.slice(markerIndex + marker.length);
  return `${documentDirectory}${documentRelativePath}`;
};

export const getPlaybackArtworkUriWithResolver = ({
  artworkUri,
  documentDirectory,
  getImagePathFromHash,
}: {
  documentDirectory: string | null | undefined;
  artworkUri: string | null | undefined;
  getImagePathFromHash: (hash: string) => ImageStoragePaths;
}) => {
  if (!artworkUri) {
    return undefined;
  }

  if (
    artworkUri.startsWith("file://") ||
    artworkUri.startsWith("/")
  ) {
    return repairPlaybackFileUriWithDocumentDirectory({
      documentDirectory,
      uri: artworkUri,
    });
  }

  if (
    artworkUri.startsWith("http://") ||
    artworkUri.startsWith("https://")
  ) {
    return artworkUri;
  }

  return getImagePathFromHash(artworkUri).pathToSmallImage;
};

export const getNativePlaybackTrackWithDependencies = ({
  documentDirectory,
  getImagePathFromHash,
  item,
}: {
  documentDirectory: string | null | undefined;
  getImagePathFromHash: (hash: string) => ImageStoragePaths;
  item: PlaybackQueueItem;
}): PlaybackTrack => ({
  albumTitle: item.album,
  artistName: item.artist,
  artworkUri: getPlaybackArtworkUriWithResolver({
    artworkUri: item.artworkUri,
    documentDirectory,
    getImagePathFromHash,
  }),
  durationMs: item.duration ?? undefined,
  id: String(item.id),
  title: item.title,
  uri: repairPlaybackFileUriWithDocumentDirectory({
    documentDirectory,
    uri: item.pathToFile,
  }),
});
