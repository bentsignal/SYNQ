import {
  assertBackupRestoreStagedItems,
  getBackupDocumentDirectoryDeletePaths,
  getBackupRestoreStagedItemMoves,
} from "./backup-file-system-plan-service";

export type BackupFileSystemDependencies = {
  cacheDirectory: string | null;
  deletePath: (
    path: string,
    options?: { idempotent?: boolean },
  ) => Promise<void>;
  documentDirectory: string | null;
  makeDirectory: (
    path: string,
    options?: { intermediates?: boolean },
  ) => Promise<void>;
  movePath: ({ from, to }: { from: string; to: string }) => Promise<void>;
  now: () => number;
  readDirectory: (path: string) => Promise<string[]>;
};

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

export const clearBackupDocumentDirectoryWithDependencies = async (
  dependencies: BackupFileSystemDependencies,
) => {
  const documentDirectory =
    getBackupDocumentDirectoryWithDependencies(dependencies);
  const items = await dependencies.readDirectory(documentDirectory);

  for (const path of getBackupDocumentDirectoryDeletePaths({
    documentDirectory,
    items,
  })) {
    await dependencies.deletePath(path, {
      idempotent: true,
    });
  }
};

export const prepareBackupRestoreStagingDirectoryWithDependencies = async (
  dependencies: BackupFileSystemDependencies,
) => {
  const stagingDirectory =
    getBackupRestoreStagingDirectoryWithDependencies(dependencies);
  await dependencies.deletePath(stagingDirectory, { idempotent: true });
  await dependencies.makeDirectory(stagingDirectory, { intermediates: true });

  return stagingDirectory;
};

export const cleanupBackupRestoreStagingDirectoryWithDependencies = async (
  stagingDirectory: string,
  dependencies: Pick<BackupFileSystemDependencies, "deletePath">,
) => {
  try {
    await dependencies.deletePath(stagingDirectory, { idempotent: true });
  } catch {
    // Cache cleanup should not hide the restore outcome.
  }
};

export const assertBackupRestoreStagingDirectoryHasFilesWithDependencies =
  async (
    stagingDirectory: string,
    dependencies: Pick<BackupFileSystemDependencies, "readDirectory">,
  ) => {
    const stagedItems = await dependencies.readDirectory(stagingDirectory);
    return assertBackupRestoreStagedItems(stagedItems);
  };

export const replaceBackupDocumentDirectoryWithStagedItemsWithDependencies =
  async ({
    dependencies,
    stagedItems,
    stagingDirectory,
  }: {
    dependencies: BackupFileSystemDependencies;
    stagedItems: string[];
    stagingDirectory: string;
  }) => {
    const documentDirectory =
      getBackupDocumentDirectoryWithDependencies(dependencies);

    await clearBackupDocumentDirectoryWithDependencies(dependencies);

    for (const move of getBackupRestoreStagedItemMoves({
      documentDirectory,
      stagedItems,
      stagingDirectory,
    })) {
      await dependencies.movePath({
        from: move.from,
        to: move.to,
      });
    }
  };
