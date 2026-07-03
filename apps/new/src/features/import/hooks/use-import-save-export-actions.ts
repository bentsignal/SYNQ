import { useReducer } from "react";
import { shareImportDraftSongs } from "@/src/features/export/services/import-draft-export-service";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  getImportSaveExportFailureCommand,
  getImportSaveExportSuccessCommand,
  importSaveExportReducer,
  initialImportSaveExportState,
} from "../services/import-save-export-state-service";
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
      const command = getImportSaveExportSuccessCommand();
      sendHaptic(command.haptic);
    } catch (caughtError) {
      const command = getImportSaveExportFailureCommand(caughtError);
      sendHaptic(command.haptic);
      if (command.action) {
        dispatchExportState(command.action);
      }
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
