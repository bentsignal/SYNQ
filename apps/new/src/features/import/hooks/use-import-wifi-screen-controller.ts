import { useCallback } from "react";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  runImportWifiRemoveSongAction,
  runImportWifiReviewSaveAction,
} from "../services/import-wifi-action-flow-service";
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

  const removeSong = useCallback(
    async (songId: number) => {
      await runImportWifiRemoveSongAction({
        canRemoveSongs: wifiState.canReviewSave,
        removeImportSongs,
        sendHaptic,
        songId,
      });
    },
    [removeImportSongs, sendHaptic, wifiState.canReviewSave],
  );

  const reviewSave = useCallback(() => {
    runImportWifiReviewSaveAction({ sendHaptic });
  }, [sendHaptic]);

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
