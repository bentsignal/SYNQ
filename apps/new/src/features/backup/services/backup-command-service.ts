import type { BackupOperation } from "../types/backup-session";
import { getBackupCommandDependencies } from "./backup-command-dependencies-service";
import { runBackupCommandWithDependencies } from "./backup-command-executor-service";

export async function runBackupCommand(
  operation: BackupOperation,
) {
  return runBackupCommandWithDependencies(
    operation,
    getBackupCommandDependencies(),
  );
}
