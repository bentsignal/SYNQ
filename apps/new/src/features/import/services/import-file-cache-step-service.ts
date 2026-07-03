export type ImportFileCachePathDependencies = {
  cacheDirectory: string | null;
  now: () => number;
};

export const sanitizeImportCacheFileName = (name: string) =>
  name.replaceAll(/[^a-zA-Z0-9._-]/g, "_");

export const getImportCacheDirectory = ({
  cacheDirectory,
}: Pick<ImportFileCachePathDependencies, "cacheDirectory">) => {
  if (!cacheDirectory) {
    throw new Error("Import cache directory is unavailable.");
  }

  return `${cacheDirectory}import`;
};

export const getCopyImportCacheDestination = ({
  dependencies,
  index,
  name,
}: {
  dependencies: ImportFileCachePathDependencies;
  index: number;
  name: string | null | undefined;
}) => {
  const fileName = sanitizeImportCacheFileName(name || `song-${index + 1}`);

  return {
    destination: `${getImportCacheDirectory(dependencies)}/${dependencies.now()}-${index}-${fileName}`,
    fileName,
  };
};

export const getBase64ImportCacheDestination = ({
  dependencies,
  id,
  name,
}: {
  dependencies: Pick<ImportFileCachePathDependencies, "cacheDirectory">;
  id: number;
  name: string;
}) => {
  const fileName = sanitizeImportCacheFileName(name || `song-${id}`);

  return {
    destination: `${getImportCacheDirectory(dependencies)}/${id}-${fileName}`,
    fileName,
  };
};
