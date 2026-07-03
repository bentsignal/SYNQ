import { resetDatabaseConnection } from "@synq/db";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import { unzip, zip } from "react-native-zip-archive";
import type { BackupOperation } from "../types/backup-session";
import {
  getPickedBackupArchiveUri,
} from "./backup-command-result-service";
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

const pickBackupArchive = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    type: "application/zip",
  });

  return getPickedBackupArchiveUri(result);
};

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
    isSharingAvailable: Sharing.isAvailableAsync,
    pickArchive: pickBackupArchive,
    prepareRestoreStagingDirectory: prepareBackupRestoreStagingDirectory,
    replaceDocumentDirectoryWithStagedItems:
      replaceBackupDocumentDirectoryWithStagedItems,
    resetDatabaseConnection,
    shareArchive: Sharing.shareAsync,
    unzipArchive: unzip,
    zipDirectory: zip,
  });
}
