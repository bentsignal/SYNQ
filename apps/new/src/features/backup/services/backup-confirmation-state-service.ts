import type { BackupOperation } from "../types/backup-session";

export const getBackupConfirmationState = (operation: BackupOperation) => {
  if (operation === "backup") {
    return null;
  }

  const isRestore = operation === "restore";

  return {
    body: isRestore
      ? "This replaces the current local library with the selected backup archive."
      : "This removes local songs, collections, metadata, and library files from this device.",
    confirmLabel: isRestore ? "Restore" : "Erase",
    title: isRestore ? "Restore library" : "Erase library",
  };
};
