import { useCallback } from "react";
import { pushNativeRoute } from "@/src/features/app-shell/services/native-route-service";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { requestImportReviewIfEligible } from "../services/import-review-request-service";
import {
  runImportDiscardAction,
  runImportFinishAction,
  runImportSaveToggleAction,
} from "../services/import-save-session-action-flow-service";
import type { ImportSessionState } from "../types/import-session";

type UseImportSaveSessionActionsParams = {
  discardSession: () => Promise<boolean>;
  premiumActive: boolean;
  saveImportSession: () => Promise<boolean>;
  setShouldSaveToLibrary: (shouldSaveToLibrary: boolean) => void;
  state: ImportSessionState;
};

export function useImportSaveSessionActions({
  discardSession,
  premiumActive,
  saveImportSession,
  setShouldSaveToLibrary,
  state,
}: UseImportSaveSessionActionsParams) {
  const { sendHaptic } = useHapticFeedback();

  const toggleShouldSaveToLibrary = useCallback(() => {
    runImportSaveToggleAction({
      sendHaptic,
      setShouldSaveToLibrary,
      state,
    });
  }, [sendHaptic, setShouldSaveToLibrary, state]);

  const finishImport = useCallback(async () => {
    await runImportFinishAction({
      navigate: pushNativeRoute,
      requestReviewIfEligible: () =>
        requestImportReviewIfEligible({ premiumActive }),
      saveImportSession,
      sendHaptic,
    });
  }, [premiumActive, saveImportSession, sendHaptic]);

  const discardImport = useCallback(async () => {
    await runImportDiscardAction({
      discardSession,
      navigate: pushNativeRoute,
      sendHaptic,
    });
  }, [discardSession, sendHaptic]);

  return {
    discardImport,
    finishImport,
    toggleShouldSaveToLibrary,
  };
}
