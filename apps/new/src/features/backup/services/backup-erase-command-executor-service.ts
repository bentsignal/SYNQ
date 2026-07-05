import type { BackupCommandResult } from "../types/backup-session";
import type { BackupCommandExecutorDependencies } from "./backup-command-executor-dependencies-service";
import { getBackupCommandResult } from "./backup-command-result-service";

export const runEraseLibraryCommand = async ({
  clearDocumentDirectory,
  resetDatabaseConnection,
}: BackupCommandExecutorDependencies): Promise<BackupCommandResult> => {
  await clearDocumentDirectory();
  await resetDatabaseConnection();

  return getBackupCommandResult("erase");
};
