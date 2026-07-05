import type { BackupFileSystemDependencies } from "./backup-file-system-dependencies-service";

export const getBackupDocumentDirectoryWithDependencies = (
  dependencies: Pick<BackupFileSystemDependencies, "documentDirectory">,
) => {
  if (!dependencies.documentDirectory) {
    throw new Error("Document directory is unavailable.");
  }

  return dependencies.documentDirectory;
};

export const getBackupRestoreStagingDirectoryWithDependencies = (
  dependencies: Pick<BackupFileSystemDependencies, "cacheDirectory" | "now">,
) => {
  if (!dependencies.cacheDirectory) {
    throw new Error("Cache directory is unavailable.");
  }

  return `${dependencies.cacheDirectory}synq-restore-${dependencies.now()}/`;
};

export const getBackupArchivePathWithDependencies = (
  dependencies: Pick<BackupFileSystemDependencies, "cacheDirectory" | "now">,
) => {
  if (!dependencies.cacheDirectory) {
    throw new Error("Cache directory is unavailable.");
  }

  return `${dependencies.cacheDirectory}synq-backup-${dependencies.now()}.zip`;
};
