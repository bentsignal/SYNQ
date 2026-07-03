import { useEffect, useRef } from "react";
import { useImportSessionSelector } from "@/src/features/import/hooks/use-import-session";
import { usePlaybackResetSession } from "@/src/features/playback/hooks/use-playback-session-selectors";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { useCustomizationSettingsSelector } from "@/src/features/settings/state/CustomizationSettingsProvider";
import { runBackupPhaseTransitionEffects } from "../services/backup-phase-effect-service";
import type { BackupSessionState } from "../types/backup-session";

export function useBackupPhaseEffects(state: BackupSessionState) {
  const { sendHaptic } = useHapticFeedback();
  const resetSession = useImportSessionSelector((store) => store.resetSession);
  const resetPlaybackSession = usePlaybackResetSession();
  const reloadCustomizationSettings = useCustomizationSettingsSelector(
    (store) => store.reloadSettings,
  );
  const previousPhaseRef = useRef(state.phase);

  useEffect(() => {
    runBackupPhaseTransitionEffects({
      currentState: state,
      previousPhase: previousPhaseRef.current,
      reloadCustomizationSettings,
      resetPlaybackSession,
      resetSession,
      sendHaptic,
    });

    previousPhaseRef.current = state.phase;
  }, [
    reloadCustomizationSettings,
    resetPlaybackSession,
    resetSession,
    sendHaptic,
    state,
  ]);
}
