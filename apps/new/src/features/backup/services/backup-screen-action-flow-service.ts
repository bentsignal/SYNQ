import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import type { BackupOperation } from "../types/backup-session";
import { getBackupConfirmationState } from "./backup-confirmation-state-service";
import {
  getBackupOperationConfirmCommand,
  getBackupOperationStartCommand,
  getBackupResetStatusCommand,
} from "./backup-interaction-command-service";

type BackupConfirmationAlertParams = {
  body: string;
  cancelLabel: string;
  confirmLabel: string;
  onConfirm: () => void;
  title: string;
};

export const runBackupOperationAction = ({
  operation,
  runOperation,
  sendHaptic,
  showConfirmation,
}: {
  operation: BackupOperation;
  runOperation: (operation: BackupOperation) => void;
  sendHaptic: (type: HapticFeedbackType) => void;
  showConfirmation: (params: BackupConfirmationAlertParams) => void;
}) => {
  sendHaptic(getBackupOperationStartCommand(operation).haptic);

  if (operation === "backup") {
    runOperation(operation);
    return;
  }

  const confirmation = getBackupConfirmationState(operation);
  if (!confirmation) {
    return;
  }

  showConfirmation({
    body: confirmation.body,
    cancelLabel: "Cancel",
    confirmLabel: confirmation.confirmLabel,
    onConfirm: () => {
      sendHaptic(getBackupOperationConfirmCommand(operation).haptic);
      runOperation(operation);
    },
    title: confirmation.title,
  });
};

export const runBackupResetStatusAction = ({
  reset,
  sendHaptic,
}: {
  reset: () => void;
  sendHaptic: (type: HapticFeedbackType) => void;
}) => {
  sendHaptic(getBackupResetStatusCommand().haptic);
  reset();
};
