import { resetDatabaseConnection } from "@synq/db";
import * as FileSystem from "expo-file-system";
import type {
  BackupCommandResult,
  BackupOperation,
} from "../types/backup-session";

const unavailableMessages = {
  backup: "Backup archive creation still needs the native zip/share service.",
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
  if (operation === "erase") {
    return runEraseLibraryCommand();
  }

  return Promise.reject(new Error(unavailableMessages[operation]));
}
