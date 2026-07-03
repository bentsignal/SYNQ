import type { BackupPhase, BackupSessionState } from "../types/backup-session";
import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";

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

export const runBackupPhaseTransitionEffects = ({
  currentState,
  previousPhase,
  reloadCustomizationSettings,
  resetPlaybackSession,
  resetSession,
  sendHaptic,
}: {
  currentState: BackupSessionState;
  previousPhase: BackupPhase;
  reloadCustomizationSettings: () => Promise<unknown> | unknown;
  resetPlaybackSession: () => void;
  resetSession: () => void;
  sendHaptic: (haptic: HapticFeedbackType) => void;
}) => {
  const effects = getBackupPhaseTransitionEffects({
    currentState,
    previousPhase,
  });

  if (effects.haptic) {
    sendHaptic(effects.haptic);
  }

  if (effects.shouldResetRuntimeSessions) {
    resetSession();
    resetPlaybackSession();
    void reloadCustomizationSettings();
  }

  return effects;
};
