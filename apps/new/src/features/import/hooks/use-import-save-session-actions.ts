import { useMemo } from "react";
import { pushNativeRoute } from "@/src/features/app-shell/services/native-route-service";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { requestImportReviewIfEligible } from "../services/import-review-request-service";
import {
  createImportSaveSessionActions,
} from "../services/import-save-session-action-service";
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

  return useMemo(
    () =>
      createImportSaveSessionActions({
        discardSession,
        navigate: pushNativeRoute,
        requestReviewIfEligible: () =>
          requestImportReviewIfEligible({ premiumActive }),
        saveImportSession,
        sendHaptic,
        setShouldSaveToLibrary,
        state,
      }),
    [
      discardSession,
      premiumActive,
      saveImportSession,
      sendHaptic,
      setShouldSaveToLibrary,
      state,
    ],
  );
}
