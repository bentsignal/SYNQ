import { useReducer } from "react";
import { shareImportDraftSongs } from "@/src/features/export/services/import-draft-export-service";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  getImportSaveExportErrorMessage,
  importSaveExportReducer,
  initialImportSaveExportState,
} from "../services/import-screen-state-service";
import type { ImportSessionState } from "../types/import-session";

type UseImportSaveExportActionsParams = {
  state: ImportSessionState;
};

export function useImportSaveExportActions({
  state,
}: UseImportSaveExportActionsParams) {
  const { sendHaptic } = useHapticFeedback();
  const [exportState, dispatchExportState] = useReducer(
    importSaveExportReducer,
    initialImportSaveExportState,
  );

  const exportSongs = async () => {
    dispatchExportState({ type: "begin" });

    try {
      await shareImportDraftSongs(state.songs);
      sendHaptic("success");
    } catch (caughtError) {
      sendHaptic("error");
      dispatchExportState({
        error: getImportSaveExportErrorMessage(caughtError),
        type: "fail",
      });
    } finally {
      dispatchExportState({ type: "finish" });
    }
  };

  return {
    exportError: exportState.error,
    exportSongs,
    isExporting: exportState.isExporting,
  };
}
