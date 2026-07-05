import { useImportSaveExportActions } from "./use-import-save-export-actions";
import { useImportSaveSessionActions } from "./use-import-save-session-actions";
import { useImportSessionSelector } from "./use-import-session";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { usePremiumEntitlementSelector } from "@/src/features/premium/state/PremiumEntitlementProvider";
import { getImportSaveViewState } from "../services/import-save-screen-state-service";
import { runImportSaveRemoveSongAction } from "../services/import-save-song-action-flow-service";

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
  const removeSong = async (songId: number) => {
    await runImportSaveRemoveSongAction({
      canRemoveSongs: actionState.canRemoveSongs,
      removeImportSongs,
      sendHaptic,
      songId,
    });
  };

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
