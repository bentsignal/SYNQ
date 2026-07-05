import type { BackupOperation, BackupSessionState } from "../types/backup-session";

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
