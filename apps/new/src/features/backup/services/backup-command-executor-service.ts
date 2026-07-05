import type {
  BackupCommandResult,
  BackupOperation,
} from "../types/backup-session";
import {
  runCreateBackupCommand,
} from "./backup-create-command-executor-service";
import { runEraseLibraryCommand } from "./backup-erase-command-executor-service";
import { runRestoreBackupCommand } from "./backup-restore-command-executor-service";
import type { BackupCommandExecutorDependencies } from "./backup-command-executor-dependencies-service";

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

export type { BackupCommandExecutorDependencies } from "./backup-command-executor-dependencies-service";
export { runCreateBackupCommand } from "./backup-create-command-executor-service";
export { runEraseLibraryCommand } from "./backup-erase-command-executor-service";
export { runRestoreBackupCommand } from "./backup-restore-command-executor-service";
