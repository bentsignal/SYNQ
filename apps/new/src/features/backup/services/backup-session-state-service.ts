import type {
  BackupCommandResult,
  BackupOperation,
  BackupSessionState,
} from "../types/backup-session";
import {
  getFailedBackupSessionState,
  getStartedBackupSessionState,
  getSucceededBackupSessionState,
} from "./backup-session-transition-service";

export type BackupSessionAction =
  | { operation: BackupOperation; type: "start" }
  | { result: BackupCommandResult; type: "succeed" }
  | { error: string; operation: BackupOperation; type: "fail" }
  | { type: "reset" };

export const initialBackupSessionState: BackupSessionState = {
  error: null,
  lastOperation: null,
  message: null,
  phase: "idle",
  requiresPremium: true,
};

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

export const backupSessionReducer = (
  state: BackupSessionState,
  action: BackupSessionAction,
): BackupSessionState => {
  switch (action.type) {
    case "start":
      return getStartedBackupSessionState({
        operation: action.operation,
        state,
      });
    case "succeed":
      return getSucceededBackupSessionState({
        result: action.result,
        state,
      });
    case "fail":
      return getFailedBackupSessionState({
        error: action.error,
        operation: action.operation,
        state,
      });
    case "reset":
      return initialBackupSessionState;
  }
};
