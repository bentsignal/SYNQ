import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import type { ImportSongDraft } from "../types/import-session";

const importCacheDirectory = `${FileSystem.cacheDirectory}import`;

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const sanitizeFileName = (name: string) =>
  name.replaceAll(/[^a-zA-Z0-9._-]/g, "_");

export const createImportCacheDirectory = async () => {
  await FileSystem.deleteAsync(importCacheDirectory, { idempotent: true });
  await FileSystem.makeDirectoryAsync(importCacheDirectory, {
    intermediates: true,
  });
};

export const copyAssetToImportCache = async ({
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

export const writeBase64AssetToImportCache = async ({
  data,
  id,
  name,
}: {
  data: string;
  id: number;
  name: string;
}) => {
  const safeName = sanitizeFileName(name || `song-${id}`);
  const destination = `${importCacheDirectory}/${id}-${safeName}`;

  await FileSystem.writeAsStringAsync(destination, data, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return {
    destination,
    fileName: safeName,
  };
};

export async function clearImportCache() {
  try {
    await FileSystem.deleteAsync(importCacheDirectory, { idempotent: true });
  } catch (error) {
    throw new Error(`Import cache cleanup failed: ${getErrorMessage(error)}`);
  }
}

export async function deleteImportDraftCacheFiles(songs: ImportSongDraft[]) {
  try {
    await Promise.all(
      songs.map((song) =>
        FileSystem.deleteAsync(song.cacheUri, { idempotent: true }),
      ),
    );
  } catch (error) {
    throw new Error(`Import file cleanup failed: ${getErrorMessage(error)}`);
  }
}
