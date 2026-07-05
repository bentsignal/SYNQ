import { useCallback, useReducer } from "react";
import { shareImportDraftSongs } from "@/src/features/export/services/import-draft-export-service";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { runImportSaveExportAction } from "../services/import-save-export-action-flow-service";
import {
  importSaveExportReducer,
  initialImportSaveExportState,
} from "../services/import-save-export-state-service";
import type { ImportSessionState } from "../types/import-session";

type UseImportSaveExportActionsParams = {
  premiumActive: boolean;
  state: ImportSessionState;
};

export function useImportSaveExportActions({
  premiumActive,
  state,
}: UseImportSaveExportActionsParams) {
  const { sendHaptic } = useHapticFeedback();
  const [exportState, dispatchExportState] = useReducer(
    importSaveExportReducer,
    initialImportSaveExportState,
  );

  const exportSongs = useCallback(async () => {
    await runImportSaveExportAction({
      dispatch: dispatchExportState,
      premiumActive,
      sendHaptic,
      shareImportDraftSongs,
      state,
    });
  }, [premiumActive, sendHaptic, state]);

  return {
    exportError: exportState.error,
    exportSongs,
    isExporting: exportState.isExporting,
  };
}
