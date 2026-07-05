import type {
  BackupCommandResult,
  BackupOperation,
} from "../types/backup-session";

export type BackupSessionAction =
  | { operation: BackupOperation; type: "start" }
  | { result: BackupCommandResult; type: "succeed" }
  | { error: string; operation: BackupOperation; type: "fail" }
  | { type: "reset" };

export const getBackupSessionErrorMessage = (caughtError: unknown) =>
  caughtError instanceof Error
    ? caughtError.message
    : "Backup operation failed.";

export const getBackupSessionStartAction = (
  operation: BackupOperation,
): BackupSessionAction => ({
  operation,
  type: "start",
});

export const getBackupSessionSucceedAction = (
  result: BackupCommandResult,
): BackupSessionAction => ({
  result,
  type: "succeed",
});

export const getBackupSessionFailAction = ({
  error,
  operation,
}: {
  error: string;
  operation: BackupOperation;
}): BackupSessionAction => ({
  error,
  operation,
  type: "fail",
});

export const getBackupSessionResetAction = (): BackupSessionAction => ({
  type: "reset",
});
