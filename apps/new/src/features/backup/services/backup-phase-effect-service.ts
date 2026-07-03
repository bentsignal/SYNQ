import type { BackupPhase, BackupSessionState } from "../types/backup-session";

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
