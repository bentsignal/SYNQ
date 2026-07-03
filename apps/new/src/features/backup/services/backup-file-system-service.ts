import * as FileSystem from "expo-file-system";

export const getBackupDocumentDirectory = () => {
  if (!FileSystem.documentDirectory) {
    throw new Error("Document directory is unavailable.");
  }

  return FileSystem.documentDirectory;
};

export const getBackupRestoreStagingDirectory = () => {
  if (!FileSystem.cacheDirectory) {
    throw new Error("Cache directory is unavailable.");
  }

  return `${FileSystem.cacheDirectory}synq-restore-${Date.now()}/`;
};

export const getBackupArchivePath = () => {
  if (!FileSystem.cacheDirectory) {
    throw new Error("Cache directory is unavailable.");
  }

  return `${FileSystem.cacheDirectory}synq-backup-${Date.now()}.zip`;
};

export const clearBackupDocumentDirectory = async () => {
  const documentDirectory = getBackupDocumentDirectory();
  const items = await FileSystem.readDirectoryAsync(documentDirectory);

  for (const item of items) {
    await FileSystem.deleteAsync(`${documentDirectory}${item}`, {
      idempotent: true,
    });
  }
};

export const prepareBackupRestoreStagingDirectory = async () => {
  const stagingDirectory = getBackupRestoreStagingDirectory();
  await FileSystem.deleteAsync(stagingDirectory, { idempotent: true });
  await FileSystem.makeDirectoryAsync(stagingDirectory, { intermediates: true });

  return stagingDirectory;
};

export const cleanupBackupRestoreStagingDirectory = async (
  stagingDirectory: string,
) => {
  try {
    await FileSystem.deleteAsync(stagingDirectory, { idempotent: true });
  } catch {
    // Cache cleanup should not hide the restore outcome.
  }
};

export const assertBackupRestoreStagingDirectoryHasFiles = async (
  stagingDirectory: string,
) => {
  const stagedItems = await FileSystem.readDirectoryAsync(stagingDirectory);

  if (stagedItems.length === 0) {
    throw new Error("Backup archive did not contain any library files.");
  }

  return stagedItems;
};

export const replaceBackupDocumentDirectoryWithStagedItems = async (
  stagingDirectory: string,
  stagedItems: string[],
) => {
  const documentDirectory = getBackupDocumentDirectory();

  await clearBackupDocumentDirectory();

  for (const item of stagedItems) {
    await FileSystem.moveAsync({
      from: `${stagingDirectory}${item}`,
      to: `${documentDirectory}${item}`,
    });
  }
};
