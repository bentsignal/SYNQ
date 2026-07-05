import type { BackupOperation } from "../types/backup-session";
import { resetBackupDatabaseConnection } from "../repository/backup-database-reset-repository";
import { pickBackupArchive } from "./backup-archive-picker-service";
import {
  isBackupArchiveSharingAvailable,
  shareBackupArchive,
} from "./backup-archive-sharing-service";
import {
  unzipBackupArchive,
  zipBackupDirectory,
} from "./backup-archive-compression-service";
import { runBackupCommandWithDependencies } from "./backup-command-executor-service";
import {
  assertBackupRestoreStagingDirectoryHasFiles,
  cleanupBackupRestoreStagingDirectory,
  clearBackupDocumentDirectory,
  getBackupArchivePath,
  getBackupDocumentDirectory,
  prepareBackupRestoreStagingDirectory,
  replaceBackupDocumentDirectoryWithStagedItems,
} from "./backup-file-system-service";

export async function runBackupCommand(
  operation: BackupOperation,
) {
  return runBackupCommandWithDependencies(operation, {
    assertRestoreStagingDirectoryHasFiles:
      assertBackupRestoreStagingDirectoryHasFiles,
    cleanupRestoreStagingDirectory: cleanupBackupRestoreStagingDirectory,
    clearDocumentDirectory: clearBackupDocumentDirectory,
    getArchivePath: getBackupArchivePath,
    getDocumentDirectory: getBackupDocumentDirectory,
    isSharingAvailable: isBackupArchiveSharingAvailable,
    pickArchive: pickBackupArchive,
    prepareRestoreStagingDirectory: prepareBackupRestoreStagingDirectory,
    replaceDocumentDirectoryWithStagedItems:
      replaceBackupDocumentDirectoryWithStagedItems,
    resetDatabaseConnection: resetBackupDatabaseConnection,
    shareArchive: shareBackupArchive,
    unzipArchive: unzipBackupArchive,
    zipDirectory: zipBackupDirectory,
  });
}
