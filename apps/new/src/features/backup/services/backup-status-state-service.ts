import type { BackupSessionState } from "../types/backup-session";
import { getBackupOperationLabel } from "./backup-action-state-service";

export const getBackupStatusState = (state: BackupSessionState) => ({
  canReset: state.phase === "failure",
  isFailure: state.phase === "failure",
  message:
    state.error ??
    state.message ??
    (state.lastOperation
      ? `${getBackupOperationLabel(state.lastOperation)} ${state.phase}`
      : "No backup operation has run."),
});

export type BackupStatusState = ReturnType<typeof getBackupStatusState>;
