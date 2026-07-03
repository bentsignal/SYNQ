import type {
  BackupCommandResult,
  BackupOperation,
} from "../types/backup-session";

const backupCommandMessages = {
  backup: "Backup archive was created and handed to the share sheet.",
  erase: "Local library files and database rows were erased.",
  restore: "Backup archive was restored into the local library.",
  "restore-cancelled": "Restore was cancelled.",
} satisfies Record<BackupOperation | "restore-cancelled", string>;

export const getBackupCommandResult = (
  operation: BackupOperation,
): BackupCommandResult => ({
  message: backupCommandMessages[operation],
  operation,
});

export const getCancelledBackupRestoreResult = (): BackupCommandResult => ({
  message: backupCommandMessages["restore-cancelled"],
  operation: "restore",
});

export type BackupDocumentPickerResult = {
  assets?: { uri?: string | null }[] | null;
  canceled: boolean;
};

export const getPickedBackupArchiveUri = (
  result: BackupDocumentPickerResult,
) => {
  if (result.canceled) {
    return null;
  }

  return result.assets?.[0]?.uri ?? null;
};
