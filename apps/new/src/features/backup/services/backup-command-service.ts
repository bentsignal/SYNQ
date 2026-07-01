import { resetDatabaseConnection } from "@synq/db";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { zip } from "react-native-zip-archive";
import type {
  BackupCommandResult,
  BackupOperation,
} from "../types/backup-session";

const unavailableMessages = {
  restore: "Restore still needs document picking, unzip, and database reset services.",
} satisfies Partial<Record<BackupOperation, string>>;

const getDocumentDirectory = () => {
  if (!FileSystem.documentDirectory) {
    throw new Error("Document directory is unavailable.");
  }

  return FileSystem.documentDirectory;
};

const clearDocumentDirectory = async () => {
  const documentDirectory = getDocumentDirectory();
  const items = await FileSystem.readDirectoryAsync(documentDirectory);

  for (const item of items) {
    await FileSystem.deleteAsync(`${documentDirectory}${item}`, {
      idempotent: true,
    });
  }
};

const getBackupArchivePath = () => {
  if (!FileSystem.cacheDirectory) {
    throw new Error("Cache directory is unavailable.");
  }

  return `${FileSystem.cacheDirectory}synq-backup-${Date.now()}.zip`;
};

const runCreateBackupCommand = async (): Promise<BackupCommandResult> => {
  const canShare = await Sharing.isAvailableAsync();

  if (!canShare) {
    throw new Error("Sharing is unavailable on this device.");
  }

  const archivePath = await zip(getDocumentDirectory(), getBackupArchivePath());
  await Sharing.shareAsync(archivePath, {
    dialogTitle: "Share SYNQ backup",
    mimeType: "application/zip",
    UTI: "com.pkware.zip-archive",
  });

  return {
    message: "Backup archive was created and handed to the share sheet.",
    operation: "backup",
  };
};

const runEraseLibraryCommand = async (): Promise<BackupCommandResult> => {
  await clearDocumentDirectory();
  await resetDatabaseConnection();

  return {
    message: "Local library files and database rows were erased.",
    operation: "erase",
  };
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

  return Promise.reject(new Error(unavailableMessages[operation]));
}
