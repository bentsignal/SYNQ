import { useEffect, useRef } from "react";
import { showNativeConfirmationAlert } from "@/src/features/app-shell/services/native-alert-service";
import { useImportSessionSelector } from "@/src/features/import/hooks/use-import-session";
import { usePremiumEntitlementSelector } from "@/src/features/premium/state/PremiumEntitlementProvider";
import { usePlaybackResetSession } from "@/src/features/playback/hooks/use-playback-session-selectors";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { useCustomizationSettingsSelector } from "@/src/features/settings/state/CustomizationSettingsProvider";
import {
  getBackupActionState,
  getBackupConfirmationState,
  getBackupOperationConfirmCommand,
  getBackupOperationStartCommand,
  getBackupPhaseTransitionEffects,
  getBackupResetStatusCommand,
  getBackupStatusState,
} from "../services/backup-screen-service";
import type { BackupOperation } from "../types/backup-session";
import { useBackupSession } from "./use-backup-session";

export function useBackupScreenController() {
  const { reset, runOperation, state } = useBackupSession();
  const { sendHaptic } = useHapticFeedback();
  const resetSession = useImportSessionSelector((store) => store.resetSession);
  const resetPlaybackSession = usePlaybackResetSession();
  const reloadCustomizationSettings = useCustomizationSettingsSelector(
    (store) => store.reloadSettings,
  );
  const premiumActive = usePremiumEntitlementSelector(
    (store) => store.state.active,
  );
  const previousPhaseRef = useRef(state.phase);
  const statusState = getBackupStatusState(state);

  useEffect(() => {
    const effects = getBackupPhaseTransitionEffects({
      currentState: state,
      previousPhase: previousPhaseRef.current,
    });

    if (effects.haptic) {
      sendHaptic(effects.haptic);
    }

    if (effects.shouldResetRuntimeSessions) {
      resetSession();
      resetPlaybackSession();
      void reloadCustomizationSettings();
    }

    previousPhaseRef.current = state.phase;
  }, [
    reloadCustomizationSettings,
    resetPlaybackSession,
    resetSession,
    sendHaptic,
    state,
  ]);

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
