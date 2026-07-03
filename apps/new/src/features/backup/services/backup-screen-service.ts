import type {
  BackupPhase,
  BackupOperation,
  BackupSessionState,
} from "../types/backup-session";
import { getSettingsBackLink } from "../../settings/services/settings-navigation-service";

export type BackupActionCard = {
  body: string;
  operation: BackupOperation;
  title: string;
};

export const backupActionCards: BackupActionCard[] = [
  {
    body: "Create a shareable archive of the local library database and media.",
    operation: "backup",
    title: "Backup your library",
  },
  {
    body: "Pick a saved archive and replace the current local library.",
    operation: "restore",
    title: "Restore your library",
  },
  {
    body: "Remove local songs, collections, metadata, and runtime library state.",
    operation: "erase",
    title: "Erase your library",
  },
];

export const getBackupScreenState = () => ({
  backLink: getSettingsBackLink(),
});

const operationLabels = {
  backup: "Backup",
  erase: "Erase",
  restore: "Restore",
} satisfies Record<BackupOperation, string>;

export const getBackupOperationLabel = (operation: BackupOperation) =>
  operationLabels[operation];

export const getBackupActionState = ({
  operation,
  premiumActive,
  state,
}: {
  operation: BackupOperation;
  premiumActive: boolean;
  state: BackupSessionState;
}) => ({
  buttonLabel: getBackupOperationLabel(operation),
  isDanger: operation === "erase",
  isDisabled: state.phase === "running",
  showPremiumBadge: state.requiresPremium && !premiumActive,
});

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

export const getBackupPhaseTransitionEffects = ({
  currentState,
  previousPhase,
}: {
  currentState: BackupSessionState;
  previousPhase: BackupPhase;
}) => {
  if (previousPhase === currentState.phase) {
    return {
      haptic: null,
      shouldResetRuntimeSessions: false,
    };
  }

  const succeededWithLibraryReplacement =
    currentState.phase === "success" &&
    (currentState.lastOperation === "erase" ||
      currentState.lastOperation === "restore");

  return {
    haptic:
      currentState.phase === "success"
        ? ("success" as const)
        : currentState.phase === "failure"
          ? ("error" as const)
          : null,
    shouldResetRuntimeSessions: succeededWithLibraryReplacement,
  };
};
