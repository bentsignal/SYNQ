import { resetDatabaseConnection } from "@synq/db";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import { unzip, zip } from "react-native-zip-archive";
import type {
  BackupCommandResult,
  BackupOperation,
} from "../types/backup-session";
import {
  getBackupCommandResult,
  getCancelledBackupRestoreResult,
  getPickedBackupArchiveUri,
} from "./backup-command-result-service";
import {
  assertBackupRestoreStagingDirectoryHasFiles,
  cleanupBackupRestoreStagingDirectory,
  clearBackupDocumentDirectory,
  getBackupArchivePath,
  getBackupDocumentDirectory,
  prepareBackupRestoreStagingDirectory,
  replaceBackupDocumentDirectoryWithStagedItems,
} from "./backup-file-system-service";

const runCreateBackupCommand = async (): Promise<BackupCommandResult> => {
  const canShare = await Sharing.isAvailableAsync();

  if (!canShare) {
    throw new Error("Sharing is unavailable on this device.");
  }

  const archivePath = await zip(
    getBackupDocumentDirectory(),
    getBackupArchivePath(),
  );
  await Sharing.shareAsync(archivePath, {
    dialogTitle: "Share SYNQ backup",
    mimeType: "application/zip",
    UTI: "com.pkware.zip-archive",
  });

  return getBackupCommandResult("backup");
};

const pickBackupArchive = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    type: "application/zip",
  });

  return getPickedBackupArchiveUri(result);
};

const runEraseLibraryCommand = async (): Promise<BackupCommandResult> => {
  await clearBackupDocumentDirectory();
  await resetDatabaseConnection();

  return getBackupCommandResult("erase");
};

const runRestoreBackupCommand = async (): Promise<BackupCommandResult> => {
  const archiveUri = await pickBackupArchive();

  if (!archiveUri) {
    return getCancelledBackupRestoreResult();
  }

  const stagingDirectory = await prepareBackupRestoreStagingDirectory();

  try {
    await unzip(archiveUri, stagingDirectory);
    const stagedItems =
      await assertBackupRestoreStagingDirectoryHasFiles(stagingDirectory);
    await replaceBackupDocumentDirectoryWithStagedItems(
      stagingDirectory,
      stagedItems,
    );
    await resetDatabaseConnection();
  } finally {
    await cleanupBackupRestoreStagingDirectory(stagingDirectory);
  }

  return getBackupCommandResult("restore");
};

export async function runBackupCommand(
  operation: BackupOperation,
): Promise<BackupCommandResult> {
  if (operation === "backup") {
    return runCreateBackupCommand();
  }

  if (operation === "erase") {
    return runEraseLibraryCommand();
  }

  return runRestoreBackupCommand();
}
