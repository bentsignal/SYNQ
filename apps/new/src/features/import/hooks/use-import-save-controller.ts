import { useImportSaveExportActions } from "./use-import-save-export-actions";
import { useImportSaveSessionActions } from "./use-import-save-session-actions";
import { getImportSaveActionState } from "../services/import-save-screen-state-service";
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
  const exportActions = useImportSaveExportActions({ state });
  const sessionActions = useImportSaveSessionActions({
    discardSession,
    saveImportSession,
    setShouldSaveToLibrary,
    state,
  });
  const actionState = getImportSaveActionState({
    isExporting: exportActions.isExporting,
    state,
  });

  return {
    actionState,
    ...exportActions,
    ...sessionActions,
  };
}

export type ImportSaveController = ReturnType<typeof useImportSaveController>;
