import { useEffect, useRef } from "react";
import { Alert } from "react-native";
import { useImportSessionSelector } from "@/src/features/import/hooks/use-import-session";
import { usePremiumEntitlementSelector } from "@/src/features/premium/context/PremiumEntitlementProvider";
import { usePlaybackSession } from "@/src/features/playback/hooks/use-playback-session";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  getBackupActionState,
  getBackupConfirmationState,
  getBackupPhaseTransitionEffects,
  getBackupStatusState,
} from "../services/backup-screen-service";
import type { BackupOperation } from "../types/backup-session";
import { useBackupSession } from "./use-backup-session";

export function useBackupScreenController() {
  const { reset, runOperation, state } = useBackupSession();
  const { sendHaptic } = useHapticFeedback();
  const resetSession = useImportSessionSelector((store) => store.resetSession);
  const { resetPlaybackSession } = usePlaybackSession();
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
    }

    previousPhaseRef.current = state.phase;
  }, [resetPlaybackSession, resetSession, sendHaptic, state]);

  const runBackupOperation = (operation: BackupOperation) => {
    sendHaptic(operation === "erase" ? "medium" : "light");

    if (operation === "backup") {
      void runOperation(operation);
      return;
    }

    const confirmation = getBackupConfirmationState(operation);
    if (!confirmation) {
      return;
    }

    Alert.alert(confirmation.title, confirmation.body, [
      {
        style: "cancel",
        text: "Cancel",
      },
      {
        onPress: () => {
          sendHaptic(operation === "erase" ? "heavy" : "medium");
          void runOperation(operation);
        },
        style: "destructive",
        text: confirmation.confirmLabel,
      },
    ]);
  };

  const resetStatus = () => {
    sendHaptic("light");
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
