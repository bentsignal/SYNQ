import { resetBackupDatabaseConnection } from "@/src/features/backup/lib/backup-database-service";
import { clearBackupDocumentDirectory } from "@/src/features/backup/lib/backup-file-service";
import { clearStoredAppState } from "@/src/features/backup/lib/backup-storage-service";
import { resetPlaybackQueue } from "@/src/features/playback/lib/player-queue-actions-service";

const wrapResetError = (message: string, error: unknown) => {
  const details = error instanceof Error ? error.message : String(error);
  return new Error(`${message} ${details}`);
};

export const clearBackupLocalState = async () => {
  try {
    await clearBackupDocumentDirectory();
  } catch (error) {
    throw wrapResetError("Error clearing document directory:", error);
  }

  try {
    await clearStoredAppState();
  } catch (error) {
    throw wrapResetError("Error clearing async storage:", error);
  }
};

export const resetBackupRuntimeState = async () => {
  try {
    await resetBackupDatabaseConnection();
  } catch (error) {
    throw wrapResetError("Error reconnecting to db:", error);
  }

  try {
    await resetPlaybackQueue();
  } catch (error) {
    throw wrapResetError("Error resetting track player:", error);
  }
};

export const resetBackupLocalAndRuntimeState = async () => {
  await clearBackupLocalState();
  await resetBackupRuntimeState();
};
