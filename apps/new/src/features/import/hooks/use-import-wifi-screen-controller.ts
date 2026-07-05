import { useMemo } from "react";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  createImportWifiControllerActions,
} from "../services/import-wifi-controller-action-service";
import { getImportWifiViewState } from "../services/import-wifi-view-state-service";
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

  const { removeSong, reviewSave } = useMemo(
    () =>
      createImportWifiControllerActions({
        canRemoveSongs: wifiState.canReviewSave,
        removeImportSongs,
        sendHaptic,
      }),
    [removeImportSongs, sendHaptic, wifiState.canReviewSave],
  );

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
