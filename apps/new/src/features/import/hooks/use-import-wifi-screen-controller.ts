import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { runImportFilesRemoveAction } from "../services/import-files-action-flow-service";
import { runImportWifiReviewSaveAction } from "../services/import-wifi-action-flow-service";
import { getImportWifiViewState } from "../services/import-wifi-screen-state-service";
import { useImportSessionSelector } from "./use-import-session";
import { useWifiImportServer } from "./use-wifi-import-server";

export function useImportWifiScreenController() {
  const removeImportSongs = useImportSessionSelector(
    (store) => store.removeImportSongs,
  );
  const state = useImportSessionSelector((store) => store.state);
  const { sendHaptic } = useHapticFeedback();
  const serverState = useWifiImportServer();
  const { actionState, songPreviewEmptyState, songPreviewListState, wifiState } =
    getImportWifiViewState({
      error: serverState.error,
      isReady: serverState.isReady,
      state,
    });

  const removeSong = async (songId: number) => {
    await runImportFilesRemoveAction({
      removeImportSongs,
      sendHaptic,
      songId,
    });
  };

  const reviewSave = () => {
    runImportWifiReviewSaveAction({ sendHaptic });
  };

  return {
    actionState,
    removeSong,
    reviewSave,
    serverState,
    songPreviewEmptyState,
    songPreviewListState,
    state,
    wifiState,
  };
}

export type ImportWifiScreenController = ReturnType<
  typeof useImportWifiScreenController
>;
