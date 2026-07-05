import type { ImportSongDraft } from "../types/import-session";
import {
  getBase64ImportCacheDestination,
  getCopyImportCacheDestination,
  getImportCacheDirectory,
} from "./import-file-cache-step-service";
import { getImportFileCacheErrorMessage } from "./import-file-cache-error-service";

export type ImportFileCacheDependencies = {
  cacheDirectory: string | null;
  copyFile: (options: { from: string; to: string }) => Promise<void>;
  deletePath: (
    path: string,
    options: { idempotent: true },
  ) => Promise<void>;
  makeDirectory: (
    path: string,
    options: { intermediates: true },
  ) => Promise<void>;
  now: () => number;
  writeBase64File: (path: string, data: string) => Promise<void>;
};

type CopyImportAssetParams = {
  dependencies: ImportFileCacheDependencies;
  index: number;
  name: string | null | undefined;
  uri: string;
};

type WriteImportAssetParams = {
  data: string;
  dependencies: ImportFileCacheDependencies;
  id: number;
  name: string;
};

export const createImportCacheDirectoryWithDependencies = async (
  dependencies: ImportFileCacheDependencies,
) => {
  const importCacheDirectory = getImportCacheDirectory(dependencies);
  await dependencies.deletePath(importCacheDirectory, { idempotent: true });
  await dependencies.makeDirectory(importCacheDirectory, {
    intermediates: true,
  });
};

export const copyAssetToImportCacheWithDependencies = async ({
  dependencies,
  index,
  name,
  uri,
}: CopyImportAssetParams) => {
  const result = getCopyImportCacheDestination({
    dependencies,
    index,
    name,
  });

  await dependencies.copyFile({
    from: uri,
    to: result.destination,
  });

  return result;
};

export const writeBase64AssetToImportCacheWithDependencies = async ({
  data,
  dependencies,
  id,
  name,
}: WriteImportAssetParams) => {
  const result = getBase64ImportCacheDestination({
    dependencies,
    id,
    name,
  });

  await dependencies.writeBase64File(result.destination, data);

  return result;
};

export async function clearImportCacheWithDependencies(
  dependencies: ImportFileCacheDependencies,
) {
  try {
    await dependencies.deletePath(getImportCacheDirectory(dependencies), {
      idempotent: true,
    });
  } catch (error) {
    throw new Error(
      `Import cache cleanup failed: ${getImportFileCacheErrorMessage(error)}`,
    );
  }
}

export async function deleteImportDraftCacheFilesWithDependencies({
  dependencies,
  songs,
}: {
  dependencies: ImportFileCacheDependencies;
  songs: ImportSongDraft[];
}) {
  try {
    await Promise.all(
      songs.map((song) =>
        dependencies.deletePath(song.cacheUri, { idempotent: true }),
      ),
    );
  } catch (error) {
    throw new Error(
      `Import file cleanup failed: ${getImportFileCacheErrorMessage(error)}`,
    );
  }
}
