import { useMemo } from "react";
import { useImportSaveExportActions } from "./use-import-save-export-actions";
import { useImportSaveSessionActions } from "./use-import-save-session-actions";
import { useImportSessionSelector } from "./use-import-session";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { usePremiumEntitlementSelector } from "@/src/features/premium/state/PremiumEntitlementProvider";
import {
  createImportSaveControllerActions,
} from "../services/import-save-controller-action-service";
import { getImportSaveViewState } from "../services/import-save-screen-state-service";

export function useImportSaveController() {
  const discardSession = useImportSessionSelector(
    (store) => store.discardSession,
  );
  const removeImportSongs = useImportSessionSelector(
    (store) => store.removeImportSongs,
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
  const { sendHaptic } = useHapticFeedback();
  const exportActions = useImportSaveExportActions({ premiumActive, state });
  const sessionActions = useImportSaveSessionActions({
    discardSession,
    premiumActive,
    saveImportSession,
    setShouldSaveToLibrary,
    state,
  });
  const viewState = getImportSaveViewState({
    isExporting: exportActions.isExporting,
    state,
  });
  const { actionState } = viewState;
  const { removeSong } = useMemo(
    () =>
      createImportSaveControllerActions({
        canRemoveSongs: actionState.canRemoveSongs,
        removeImportSongs,
        sendHaptic,
      }),
    [actionState.canRemoveSongs, removeImportSongs, sendHaptic],
  );

  return {
    actionState,
    removeSong,
    state,
    viewState,
    ...exportActions,
    ...sessionActions,
  };
}

export type ImportSaveController = ReturnType<typeof useImportSaveController>;
