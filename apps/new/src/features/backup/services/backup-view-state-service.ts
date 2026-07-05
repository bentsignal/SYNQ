import type { BackupSessionState } from "../types/backup-session";
import {
  backupActionCards,
  getBackupActionState,
} from "./backup-action-state-service";
import { getBackupScreenState } from "./backup-screen-state-service";
import { getBackupStatusState } from "./backup-status-state-service";

export const getBackupViewState = ({
  premiumActive,
  state,
}: {
  premiumActive: boolean;
  state: BackupSessionState;
}) => ({
  actionCards: backupActionCards.map((action) => ({
    ...action,
    actionState: getBackupActionState({
      operation: action.operation,
      premiumActive,
      state,
    }),
  })),
  screenState: getBackupScreenState(),
  statusState: getBackupStatusState(state),
});

export type BackupActionCardViewState = ReturnType<
  typeof getBackupViewState
>["actionCards"][number];

export type BackupViewState = ReturnType<typeof getBackupViewState>;
