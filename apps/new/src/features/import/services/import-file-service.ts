import {
  getAudioDurationFromFile,
  getMetadataFromFile,
  getTrackNumberFromString,
  supportedAudioFileTypes,
} from "@synq/audio";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import type { ImportSongDraft } from "../types/import-session";

const importCacheDirectory = `${FileSystem.cacheDirectory}import`;

const fallbackLabel = "Unknown";

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const sanitizeFileName = (name: string) =>
  name.replaceAll(/[^a-zA-Z0-9._-]/g, "_");

const createImportCacheDirectory = async () => {
  await FileSystem.deleteAsync(importCacheDirectory, { idempotent: true });
  await FileSystem.makeDirectoryAsync(importCacheDirectory, {
    intermediates: true,
  });
};

const copyAssetToImportCache = async ({
  asset,
  index,
}: {
  asset: DocumentPicker.DocumentPickerAsset;
  index: number;
}) => {
  const safeName = sanitizeFileName(asset.name || `song-${index + 1}`);
  const destination = `${importCacheDirectory}/${Date.now()}-${index}-${safeName}`;

  await FileSystem.copyAsync({
    from: asset.uri,
    to: destination,
  });

  return {
    destination,
    fileName: safeName,
  };
};

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

const processImportAsset = async ({
  asset,
  index,
}: {
  asset: DocumentPicker.DocumentPickerAsset;
  index: number;
}): Promise<ImportSongDraft> => {
  const { destination, fileName } = await copyAssetToImportCache({
    asset,
    index,
  });
  let metadata: Awaited<ReturnType<typeof getMetadataFromFile>> | null = null;

  try {
    metadata = await getMetadataFromFile(destination);
  } catch {
    metadata = null;
  }

  let duration: number | null = null;
  try {
    duration = (await getAudioDurationFromFile(destination)) * 1000;
  } catch {
    duration = null;
  }

  const rawTitle = metadata?.name?.trim() || getTitleFromFileName(fileName);
  const { strippedValue } = getTrackNumberFromString(rawTitle);

  return {
    album: metadata?.album?.trim() || fallbackLabel,
    artist: metadata?.artist?.trim() || fallbackLabel,
    cacheUri: destination,
    duration,
    fileName,
    fileType: asset.mimeType ?? fileName,
    id: Date.now() + index,
    title: strippedValue.trim() || rawTitle,
    track: getTrackFromMetadata({
      fileName,
      metadataTrack: metadata?.track,
      title: rawTitle,
    }),
  };
};

export async function selectImportFiles(): Promise<{
  drafts: ImportSongDraft[];
  skipped: number;
}> {
  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    multiple: true,
    type: supportedAudioFileTypes,
  });

  if (result.canceled) {
    return {
      drafts: [],
      skipped: 0,
    };
  }

  await createImportCacheDirectory();

  const drafts: ImportSongDraft[] = [];
  let skipped = 0;

  for (let index = 0; index < result.assets.length; index += 1) {
    const asset = result.assets[index];
    try {
      drafts.push(await processImportAsset({ asset, index }));
    } catch {
      skipped += 1;
    }
  }

  return {
    drafts,
    skipped,
  };
}

export async function clearImportCache() {
  try {
    await FileSystem.deleteAsync(importCacheDirectory, { idempotent: true });
  } catch (error) {
    throw new Error(`Import cache cleanup failed: ${getErrorMessage(error)}`);
  }
}
