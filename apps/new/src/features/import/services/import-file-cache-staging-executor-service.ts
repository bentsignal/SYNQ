import type { ImportFileCacheDependencies } from "./import-file-cache-dependencies-service";
import {
  getBase64ImportCacheDestination,
  getCopyImportCacheDestination,
  getImportCacheDirectory,
} from "./import-file-cache-step-service";

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
