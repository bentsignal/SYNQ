import { useImportSaveExportActions } from "./use-import-save-export-actions";
import { useImportSaveSessionActions } from "./use-import-save-session-actions";
import { useImportSessionSelector } from "./use-import-session";
import { usePremiumEntitlementSelector } from "@/src/features/premium/state/PremiumEntitlementProvider";
import { getImportSaveActionState } from "../services/import-save-screen-state-service";

export function useImportSaveController() {
  const discardSession = useImportSessionSelector(
    (store) => store.discardSession,
  );
  const saveImportSession = useImportSessionSelector(
    (store) => store.saveImportSession,
  );
  const setShouldSaveToLibrary = useImportSessionSelector(
    (store) => store.setShouldSaveToLibrary,
  );
  const state = useImportSessionSelector((store) => store.state);
  const premiumActive = usePremiumEntitlementSelector(
    (store) => store.state.active,
  );
  const exportActions = useImportSaveExportActions({ state });
  const sessionActions = useImportSaveSessionActions({
    discardSession,
    premiumActive,
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
    state,
    ...exportActions,
    ...sessionActions,
  };
}

export type ImportSaveController = ReturnType<typeof useImportSaveController>;
