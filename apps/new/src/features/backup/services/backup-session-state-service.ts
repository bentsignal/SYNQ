import type {
  BackupCommandResult,
  BackupOperation,
  BackupSessionState,
} from "../types/backup-session";

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
      return {
        ...state,
        error: null,
        lastOperation: action.operation,
        message: null,
        phase: "running",
      };
    case "succeed":
      return {
        ...state,
        error: null,
        lastOperation: action.result.operation,
        message: action.result.message,
        phase: "success",
      };
    case "fail":
      return {
        ...state,
        error: action.error,
        lastOperation: action.operation,
        message: null,
        phase: "failure",
      };
    case "reset":
      return initialBackupSessionState;
  }
};
