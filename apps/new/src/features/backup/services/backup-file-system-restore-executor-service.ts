import type { BackupFileSystemDependencies } from "./backup-file-system-dependencies-service";
import { clearBackupDocumentDirectoryWithDependencies } from "./backup-file-system-document-executor-service";
import {
  assertBackupRestoreStagedItems,
  getBackupRestoreStagedItemMoves,
} from "./backup-file-system-plan-service";
import {
  getBackupDocumentDirectoryWithDependencies,
  getBackupRestoreStagingDirectoryWithDependencies,
} from "./backup-file-system-path-service";

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
