import type * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import type { ImportSongDraft } from "../types/import-session";
import {
  clearImportCacheWithDependencies,
  copyAssetToImportCacheWithDependencies,
  createImportCacheDirectoryWithDependencies,
  deleteImportDraftCacheFilesWithDependencies,
  writeBase64AssetToImportCacheWithDependencies,
  type ImportFileCacheDependencies,
} from "./import-file-cache-executor-service";

const importFileCacheDependencies: ImportFileCacheDependencies = {
  cacheDirectory: FileSystem.cacheDirectory,
  copyFile: FileSystem.copyAsync,
  deletePath: FileSystem.deleteAsync,
  makeDirectory: FileSystem.makeDirectoryAsync,
  now: Date.now,
  writeBase64File: async (path, data) => {
    await FileSystem.writeAsStringAsync(path, data, {
      encoding: FileSystem.EncodingType.Base64,
    });
  },
};

export const createImportCacheDirectory = async () => {
  await createImportCacheDirectoryWithDependencies(importFileCacheDependencies);
};

export const copyAssetToImportCache = async ({
  asset,
  index,
}: {
  asset: DocumentPicker.DocumentPickerAsset;
  index: number;
}) => {
  return copyAssetToImportCacheWithDependencies({
    dependencies: importFileCacheDependencies,
    index,
    name: asset.name,
    uri: asset.uri,
  });
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
  return writeBase64AssetToImportCacheWithDependencies({
    data,
    dependencies: importFileCacheDependencies,
    id,
    name,
  });
};

export async function clearImportCache() {
  await clearImportCacheWithDependencies(importFileCacheDependencies);
}

export async function deleteImportDraftCacheFiles(songs: ImportSongDraft[]) {
  await deleteImportDraftCacheFilesWithDependencies({
    dependencies: importFileCacheDependencies,
    songs,
  });
}
