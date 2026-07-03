import { showNativeConfirmationAlert } from "@/src/features/app-shell/services/native-alert-service";
import { usePremiumEntitlementSelector } from "@/src/features/premium/state/PremiumEntitlementProvider";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  getBackupActionState,
  getBackupConfirmationState,
  getBackupOperationConfirmCommand,
  getBackupOperationStartCommand,
  getBackupResetStatusCommand,
  getBackupStatusState,
} from "../services/backup-screen-service";
import type { BackupOperation } from "../types/backup-session";
import { useBackupPhaseEffects } from "./use-backup-phase-effects";
import { useBackupSession } from "./use-backup-session";

export function useBackupScreenController() {
  const { reset, runOperation, state } = useBackupSession();
  const { sendHaptic } = useHapticFeedback();
  const premiumActive = usePremiumEntitlementSelector(
    (store) => store.state.active,
  );
  const statusState = getBackupStatusState(state);

  useBackupPhaseEffects(state);

  const runBackupOperation = (operation: BackupOperation) => {
    sendHaptic(getBackupOperationStartCommand(operation).haptic);

    if (operation === "backup") {
      void runOperation(operation);
      return;
    }

    const confirmation = getBackupConfirmationState(operation);
    if (!confirmation) {
      return;
    }

    showNativeConfirmationAlert({
      body: confirmation.body,
      cancelLabel: "Cancel",
      confirmLabel: confirmation.confirmLabel,
      onConfirm: () => {
        sendHaptic(getBackupOperationConfirmCommand(operation).haptic);
        void runOperation(operation);
      },
      title: confirmation.title,
    });
  };

  const resetStatus = () => {
    sendHaptic(getBackupResetStatusCommand().haptic);
    reset();
  };

  const getActionState = (operation: BackupOperation) =>
    getBackupActionState({
      operation,
      premiumActive,
      state,
    });

  return {
    getActionState,
    resetStatus,
    runBackupOperation,
    statusState,
  };
}

export type BackupScreenController = ReturnType<
  typeof useBackupScreenController
>;
