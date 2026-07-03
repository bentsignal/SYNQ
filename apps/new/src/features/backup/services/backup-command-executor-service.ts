import type {
  BackupCommandResult,
  BackupOperation,
} from "../types/backup-session";
import {
  getBackupCommandResult,
  getCancelledBackupRestoreResult,
} from "./backup-command-result-service";

export type BackupCommandExecutorDependencies = {
  assertRestoreStagingDirectoryHasFiles: (
    stagingDirectory: string,
  ) => Promise<string[]>;
  cleanupRestoreStagingDirectory: (stagingDirectory: string) => Promise<void>;
  clearDocumentDirectory: () => Promise<void>;
  getArchivePath: () => string;
  getDocumentDirectory: () => string;
  isSharingAvailable: () => Promise<boolean>;
  pickArchive: () => Promise<string | null>;
  prepareRestoreStagingDirectory: () => Promise<string>;
  replaceDocumentDirectoryWithStagedItems: (
    stagingDirectory: string,
    stagedItems: string[],
  ) => Promise<void>;
  resetDatabaseConnection: () => Promise<void>;
  shareArchive: (
    archivePath: string,
    options: {
      UTI: string;
      dialogTitle: string;
      mimeType: string;
    },
  ) => Promise<void>;
  unzipArchive: (
    archiveUri: string,
    stagingDirectory: string,
  ) => Promise<unknown>;
  zipDirectory: (sourceDirectory: string, archivePath: string) => Promise<string>;
};

const runCreateBackupCommand = async ({
  getArchivePath,
  getDocumentDirectory,
  isSharingAvailable,
  shareArchive,
  zipDirectory,
}: BackupCommandExecutorDependencies): Promise<BackupCommandResult> => {
  const canShare = await isSharingAvailable();

  if (!canShare) {
    throw new Error("Sharing is unavailable on this device.");
  }

  const archivePath = await zipDirectory(getDocumentDirectory(), getArchivePath());
  await shareArchive(archivePath, {
    dialogTitle: "Share SYNQ backup",
    mimeType: "application/zip",
    UTI: "com.pkware.zip-archive",
  });

  return getBackupCommandResult("backup");
};

const runEraseLibraryCommand = async ({
  clearDocumentDirectory,
  resetDatabaseConnection,
}: BackupCommandExecutorDependencies): Promise<BackupCommandResult> => {
  await clearDocumentDirectory();
  await resetDatabaseConnection();

  return getBackupCommandResult("erase");
};

const runRestoreBackupCommand = async ({
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

export async function runBackupCommandWithDependencies(
  operation: BackupOperation,
  dependencies: BackupCommandExecutorDependencies,
): Promise<BackupCommandResult> {
  if (operation === "backup") {
    return runCreateBackupCommand(dependencies);
  }

  if (operation === "erase") {
    return runEraseLibraryCommand(dependencies);
  }

  return runRestoreBackupCommand(dependencies);
}
