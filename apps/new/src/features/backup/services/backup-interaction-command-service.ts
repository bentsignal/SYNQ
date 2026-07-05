import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import type { BackupOperation } from "../types/backup-session";

type BackupInteractionCommand = {
  haptic: HapticFeedbackType;
};

export const getBackupOperationStartCommand = (
  operation: BackupOperation,
): BackupInteractionCommand => ({
  haptic: operation === "erase" ? "medium" : "light",
});

export const getBackupOperationConfirmCommand = (
  operation: BackupOperation,
): BackupInteractionCommand => ({
  haptic: operation === "erase" ? "heavy" : "medium",
});

export const getBackupResetStatusCommand = (): BackupInteractionCommand => ({
  haptic: "light",
});
