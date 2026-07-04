import { useImportSaveExportActions } from "./use-import-save-export-actions";
import { useImportSaveSessionActions } from "./use-import-save-session-actions";
import { useImportSessionSelector } from "./use-import-session";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { usePremiumEntitlementSelector } from "@/src/features/premium/state/PremiumEntitlementProvider";
import { runImportFilesRemoveAction } from "../services/import-files-action-flow-service";
import { getImportSaveActionState } from "../services/import-save-screen-state-service";

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
  const actionState = getImportSaveActionState({
    isExporting: exportActions.isExporting,
    state,
  });
  const removeSong = async (songId: number) => {
    if (!actionState.canRemoveSongs) {
      return;
    }

    await runImportFilesRemoveAction({
      removeImportSongs,
      sendHaptic,
      songId,
    });
  };

  return {
    actionState,
    removeSong,
    state,
    ...exportActions,
    ...sessionActions,
  };
}

export type ImportSaveController = ReturnType<typeof useImportSaveController>;
