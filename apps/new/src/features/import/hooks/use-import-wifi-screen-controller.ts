import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { getImportWifiState } from "../services/import-wifi-screen-state-service";
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
    sendHaptic("medium");
    const removed = await removeImportSongs([songId]);
    sendHaptic(removed ? "success" : "error");
  };

  const reviewSave = () => {
    sendHaptic("light");
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
