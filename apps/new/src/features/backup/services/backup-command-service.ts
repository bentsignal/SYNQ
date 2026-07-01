import type {
  BackupCommandResult,
  BackupOperation,
} from "../types/backup-session";

const unavailableMessages = {
  backup: "Backup archive creation still needs the native zip/share service.",
  erase: "Library erase still needs the shared database reset service.",
  restore: "Restore still needs document picking, unzip, and database reset services.",
} satisfies Record<BackupOperation, string>;

export async function runUnavailableBackupCommand(
  operation: BackupOperation,
): Promise<BackupCommandResult> {
  return Promise.reject(new Error(unavailableMessages[operation]));
}
