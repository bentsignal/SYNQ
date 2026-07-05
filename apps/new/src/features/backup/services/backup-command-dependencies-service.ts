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
import type { BackupCommandExecutorDependencies } from "./backup-command-executor-service";
import {
  assertBackupRestoreStagingDirectoryHasFiles,
  cleanupBackupRestoreStagingDirectory,
  clearBackupDocumentDirectory,
  getBackupArchivePath,
  getBackupDocumentDirectory,
  prepareBackupRestoreStagingDirectory,
  replaceBackupDocumentDirectoryWithStagedItems,
} from "./backup-file-system-service";

export function getBackupCommandDependencies(): BackupCommandExecutorDependencies {
  return {
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
  };
}
