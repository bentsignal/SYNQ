import { showNativeConfirmationAlert } from "@/src/features/app-shell/services/native-alert-service";
import { usePremiumEntitlementSelector } from "@/src/features/premium/state/PremiumEntitlementProvider";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { getBackupViewState } from "../services/backup-screen-service";
import {
  runBackupOperationAction,
  runBackupResetStatusAction,
} from "../services/backup-screen-action-flow-service";
import type { BackupOperation } from "../types/backup-session";
import { useBackupPhaseEffects } from "./use-backup-phase-effects";
import { useBackupSession } from "./use-backup-session";

export function useBackupScreenController() {
  const { reset, runOperation, state } = useBackupSession();
  const { sendHaptic } = useHapticFeedback();
  const premiumActive = usePremiumEntitlementSelector(
    (store) => store.state.active,
  );
  const { actionCards, screenState, statusState } = getBackupViewState({
    premiumActive,
    state,
  });

  useBackupPhaseEffects(state);

  const runBackupOperation = (operation: BackupOperation) => {
    runBackupOperationAction({
      operation,
      runOperation: (nextOperation) => {
        void runOperation(nextOperation);
      },
      sendHaptic,
      showConfirmation: showNativeConfirmationAlert,
    });
  };

  const resetStatus = () => {
    runBackupResetStatusAction({ reset, sendHaptic });
  };

  return {
    actionCards,
    resetStatus,
    runBackupOperation,
    screenState,
    statusState,
  };
}

export type BackupScreenController = ReturnType<
  typeof useBackupScreenController
>;
