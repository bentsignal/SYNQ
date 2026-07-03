import { pushNativeRoute } from "@/src/features/app-shell/services/native-route-service";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  runImportDiscardAction,
  runImportFinishAction,
  runImportSaveToggleAction,
} from "../services/import-save-session-action-flow-service";
import type { ImportSessionState } from "../types/import-session";

type UseImportSaveSessionActionsParams = {
  discardSession: () => Promise<boolean>;
  saveImportSession: () => Promise<boolean>;
  setShouldSaveToLibrary: (shouldSaveToLibrary: boolean) => void;
  state: ImportSessionState;
};

export function useImportSaveSessionActions({
  discardSession,
  saveImportSession,
  setShouldSaveToLibrary,
  state,
}: UseImportSaveSessionActionsParams) {
  const { sendHaptic } = useHapticFeedback();

  const toggleShouldSaveToLibrary = () => {
    runImportSaveToggleAction({
      sendHaptic,
      setShouldSaveToLibrary,
      state,
    });
  };

  const finishImport = async () => {
    await runImportFinishAction({
      navigate: pushNativeRoute,
      saveImportSession,
      sendHaptic,
    });
  };

  const discardImport = async () => {
    await runImportDiscardAction({
      discardSession,
      navigate: pushNativeRoute,
      sendHaptic,
    });
  };

  return {
    discardImport,
    finishImport,
    toggleShouldSaveToLibrary,
  };
}
