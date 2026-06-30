import { getAudioMetadata } from "@missingcore/audio-metadata";

export const audioMetadataTagsToRetrieve = [
  "artwork",
  "artist",
  "name",
  "album",
  "year",
  "track",
] as const;

export const supportedAudioFileTypes = [
  "audio/mpeg",
  "audio/wav",
  "audio/mp4",
  "audio/flac",
  "audio/aac",
];

export const getMetadataFromFile = async (filePath: string) => {
  const result = await getAudioMetadata(filePath, audioMetadataTagsToRetrieve);
  return result.metadata;
};
