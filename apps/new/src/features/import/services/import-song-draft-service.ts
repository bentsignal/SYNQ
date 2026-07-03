import {
  getAudioDurationFromFile,
  getMetadataFromFile,
  getTrackNumberFromString,
} from "@synq/audio";
import type { ImportSongDraft } from "../types/import-session";

const fallbackLabel = "Unknown";

const getTitleFromFileName = (fileName: string) => {
  const withoutExtension = fileName.replace(/\.[^.]+$/, "");
  const { strippedValue } = getTrackNumberFromString(withoutExtension);

  return strippedValue.trim() || withoutExtension || "Untitled song";
};

const getTrackFromMetadata = ({
  fileName,
  metadataTrack,
  title,
}: {
  fileName: string;
  metadataTrack: number | null | undefined;
  title: string;
}) => {
  if (metadataTrack) {
    return metadataTrack;
  }

  const titleTrack = getTrackNumberFromString(title).trackNumber;
  if (titleTrack) {
    return titleTrack;
  }

  return getTrackNumberFromString(fileName).trackNumber;
};

export const processCachedImportFile = async ({
  cacheUri,
  fileName,
  fileType,
  id,
}: {
  cacheUri: string;
  fileName: string;
  fileType: string;
  id: number;
}): Promise<ImportSongDraft> => {
  let metadata: Awaited<ReturnType<typeof getMetadataFromFile>> | null = null;

  try {
    metadata = await getMetadataFromFile(cacheUri);
  } catch {
    metadata = null;
  }

  let duration: number | null = null;
  try {
    duration = (await getAudioDurationFromFile(cacheUri)) * 1000;
  } catch {
    duration = null;
  }

  const rawTitle = metadata?.name?.trim() || getTitleFromFileName(fileName);
  const { strippedValue } = getTrackNumberFromString(rawTitle);

  return {
    album: metadata?.album?.trim() || fallbackLabel,
    artist: metadata?.artist?.trim() || fallbackLabel,
    artwork: metadata?.artwork ?? null,
    cacheUri,
    duration,
    fileName,
    fileType,
    id,
    title: strippedValue.trim() || rawTitle,
    track: getTrackFromMetadata({
      fileName,
      metadataTrack: metadata?.track,
      title: rawTitle,
    }),
  };
};
