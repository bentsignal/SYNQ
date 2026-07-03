import * as FileSystem from "expo-file-system";
import {
  assertBackupRestoreStagingDirectoryHasFilesWithDependencies,
  cleanupBackupRestoreStagingDirectoryWithDependencies,
  clearBackupDocumentDirectoryWithDependencies,
  getBackupArchivePathWithDependencies,
  getBackupDocumentDirectoryWithDependencies,
  getBackupRestoreStagingDirectoryWithDependencies,
  prepareBackupRestoreStagingDirectoryWithDependencies,
  replaceBackupDocumentDirectoryWithStagedItemsWithDependencies,
  type BackupFileSystemDependencies,
} from "./backup-file-system-executor-service";

const backupFileSystemDependencies: BackupFileSystemDependencies = {
  cacheDirectory: FileSystem.cacheDirectory,
  deletePath: FileSystem.deleteAsync,
  documentDirectory: FileSystem.documentDirectory,
  makeDirectory: FileSystem.makeDirectoryAsync,
  movePath: FileSystem.moveAsync,
  now: Date.now,
  readDirectory: FileSystem.readDirectoryAsync,
};

export const getBackupDocumentDirectory = () => {
  return getBackupDocumentDirectoryWithDependencies(
    backupFileSystemDependencies,
  );
};

export const getBackupRestoreStagingDirectory = () => {
  return getBackupRestoreStagingDirectoryWithDependencies(
    backupFileSystemDependencies,
  );
};

export const getBackupArchivePath = () => {
  return getBackupArchivePathWithDependencies(backupFileSystemDependencies);
};

export const clearBackupDocumentDirectory = async () => {
  await clearBackupDocumentDirectoryWithDependencies(
    backupFileSystemDependencies,
  );
};

export const prepareBackupRestoreStagingDirectory = async () => {
  return prepareBackupRestoreStagingDirectoryWithDependencies(
    backupFileSystemDependencies,
  );
};

export const cleanupBackupRestoreStagingDirectory = async (
  stagingDirectory: string,
) => {
  await cleanupBackupRestoreStagingDirectoryWithDependencies(
    stagingDirectory,
    backupFileSystemDependencies,
  );
};

export const assertBackupRestoreStagingDirectoryHasFiles = async (
  stagingDirectory: string,
) => {
  return assertBackupRestoreStagingDirectoryHasFilesWithDependencies(
    stagingDirectory,
    backupFileSystemDependencies,
  );
};

export const replaceBackupDocumentDirectoryWithStagedItems = async (
  stagingDirectory: string,
  stagedItems: string[],
) => {
  await replaceBackupDocumentDirectoryWithStagedItemsWithDependencies({
    dependencies: backupFileSystemDependencies,
    stagedItems,
    stagingDirectory,
  });
};
