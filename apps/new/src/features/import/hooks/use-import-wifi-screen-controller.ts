import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  getImportFileRemovalResultCommand,
  getImportFileRemovalStartHaptic,
} from "../services/import-file-command-service";
import {
  getImportWifiReviewSaveHaptic,
  getImportWifiState,
} from "../services/import-wifi-screen-state-service";
import { useImportSessionSelector } from "./use-import-session";
import { useWifiImportServer } from "./use-wifi-import-server";

export function useImportWifiScreenController() {
  const removeImportSongs = useImportSessionSelector(
    (store) => store.removeImportSongs,
  );
  const state = useImportSessionSelector((store) => store.state);
  const { sendHaptic } = useHapticFeedback();
  const serverState = useWifiImportServer();
  const wifiState = getImportWifiState({
    error: serverState.error,
    isReady: serverState.isReady,
    state,
  });

  const removeSong = async (songId: number) => {
    sendHaptic(getImportFileRemovalStartHaptic());
    const removed = await removeImportSongs([songId]);
    const command = getImportFileRemovalResultCommand(removed);
    sendHaptic(command.haptic);
  };

  const reviewSave = () => {
    sendHaptic(getImportWifiReviewSaveHaptic());
  };

  return {
    removeSong,
    reviewSave,
    serverState,
    state,
    wifiState,
  };
}

export type ImportWifiScreenController = ReturnType<
  typeof useImportWifiScreenController
>;
