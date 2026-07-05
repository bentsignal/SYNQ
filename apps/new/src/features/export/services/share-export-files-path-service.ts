export const getShareExportDirectoryWithDependencies = ({
  cacheDirectory,
  directoryPrefix,
  now,
}: {
  cacheDirectory: string | null;
  directoryPrefix: string;
  now: () => number;
}) => {
  if (!cacheDirectory) {
    throw new Error("Cache directory is unavailable.");
  }

  return `${cacheDirectory}${directoryPrefix}-${now()}`;
};
