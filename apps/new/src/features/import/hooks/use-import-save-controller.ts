import { useReducer } from "react";
import { router } from "expo-router";
import { shareImportDraftSongs } from "@/src/features/export/services/import-draft-export-service";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  getImportDiscardResultHref,
  getImportFinishResultHref,
  getImportSaveActionState,
  getImportSaveExportErrorMessage,
  importSaveExportReducer,
  initialImportSaveExportState,
} from "../services/import-screen-state-service";
import type { ImportSessionState } from "../types/import-session";

type UseImportSaveControllerParams = {
  discardSession: () => Promise<boolean>;
  saveImportSession: () => Promise<boolean>;
  setShouldSaveToLibrary: (shouldSaveToLibrary: boolean) => void;
  state: ImportSessionState;
};

export function useImportSaveController({
  discardSession,
  saveImportSession,
  setShouldSaveToLibrary,
  state,
}: UseImportSaveControllerParams) {
  const { sendHaptic } = useHapticFeedback();
  const [exportState, dispatchExportState] = useReducer(
    importSaveExportReducer,
    initialImportSaveExportState,
  );
  const actionState = getImportSaveActionState({
    isExporting: exportState.isExporting,
    state,
  });

  const toggleShouldSaveToLibrary = () => {
    sendHaptic("light");
    setShouldSaveToLibrary(!state.shouldSaveToLibrary);
  };

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

  const finishImport = async () => {
    sendHaptic("medium");
    const succeeded = await saveImportSession();
    sendHaptic(succeeded ? "success" : "error");
    router.push(getImportFinishResultHref(succeeded));
  };

  const discardImport = async () => {
    sendHaptic("medium");
    const discarded = await discardSession();
    sendHaptic(discarded ? "success" : "error");
    router.push(getImportDiscardResultHref(discarded));
  };

  return {
    actionState,
    discardImport,
    exportError: exportState.error,
    exportSongs,
    finishImport,
    toggleShouldSaveToLibrary,
  };
}

export type ImportSaveController = ReturnType<typeof useImportSaveController>;
