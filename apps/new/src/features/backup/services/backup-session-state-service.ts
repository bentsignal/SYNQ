import type { BackupSessionState } from "../types/backup-session";
import type { BackupSessionAction } from "./backup-session-action-service";
import {
  getFailedBackupSessionState,
  getStartedBackupSessionState,
  getSucceededBackupSessionState,
} from "./backup-session-transition-service";

export const initialBackupSessionState: BackupSessionState = {
  error: null,
  lastOperation: null,
  message: null,
  phase: "idle",
  requiresPremium: true,
};

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
