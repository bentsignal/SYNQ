import type { BackupCommandResult } from "../types/backup-session";
import type { BackupCommandExecutorDependencies } from "./backup-command-executor-dependencies-service";
import {
  getBackupCommandResult,
  getCancelledBackupRestoreResult,
} from "./backup-command-result-service";

export const runRestoreBackupCommand = async ({
  assertRestoreStagingDirectoryHasFiles,
  cleanupRestoreStagingDirectory,
  pickArchive,
  prepareRestoreStagingDirectory,
  replaceDocumentDirectoryWithStagedItems,
  resetDatabaseConnection,
  unzipArchive,
}: BackupCommandExecutorDependencies): Promise<BackupCommandResult> => {
  const archiveUri = await pickArchive();

  if (!archiveUri) {
    return getCancelledBackupRestoreResult();
  }

  const stagingDirectory = await prepareRestoreStagingDirectory();

  try {
    await unzipArchive(archiveUri, stagingDirectory);
    const stagedItems =
      await assertRestoreStagingDirectoryHasFiles(stagingDirectory);
    await replaceDocumentDirectoryWithStagedItems(
      stagingDirectory,
      stagedItems,
    );
    await resetDatabaseConnection();
  } finally {
    await cleanupRestoreStagingDirectory(stagingDirectory);
  }

  return getBackupCommandResult("restore");
};
