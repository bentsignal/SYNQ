import type { BackupCommandResult } from "../types/backup-session";
import { getBackupCommandResult } from "./backup-command-result-service";
import type { BackupCommandExecutorDependencies } from "./backup-command-executor-dependencies-service";

export const runCreateBackupCommand = async ({
  getArchivePath,
  getDocumentDirectory,
  isSharingAvailable,
  shareArchive,
  zipDirectory,
}: BackupCommandExecutorDependencies): Promise<BackupCommandResult> => {
  const canShare = await isSharingAvailable();

  if (!canShare) {
    throw new Error("Sharing is unavailable on this device.");
  }

  const archivePath = await zipDirectory(getDocumentDirectory(), getArchivePath());
  await shareArchive(archivePath, {
    dialogTitle: "Share SYNQ backup",
    mimeType: "application/zip",
    UTI: "com.pkware.zip-archive",
  });

  return getBackupCommandResult("backup");
};
