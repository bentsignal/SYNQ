import type {
  BackupCommandResult,
  BackupOperation,
  BackupSessionState,
} from "../types/backup-session";

export const getStartedBackupSessionState = ({
  operation,
  state,
}: {
  operation: BackupOperation;
  state: BackupSessionState;
}): BackupSessionState => ({
  ...state,
  error: null,
  lastOperation: operation,
  message: null,
  phase: "running",
});

export const getSucceededBackupSessionState = ({
  result,
  state,
}: {
  result: BackupCommandResult;
  state: BackupSessionState;
}): BackupSessionState => ({
  ...state,
  error: null,
  lastOperation: result.operation,
  message: result.message,
  phase: "success",
});

export const getFailedBackupSessionState = ({
  error,
  operation,
  state,
}: {
  error: string;
  operation: BackupOperation;
  state: BackupSessionState;
}): BackupSessionState => ({
  ...state,
  error,
  lastOperation: operation,
  message: null,
  phase: "failure",
});
