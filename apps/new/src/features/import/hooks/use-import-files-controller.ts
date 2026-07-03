import { useCallback } from "react";
import { pushNativeRoute } from "@/src/features/app-shell/services/native-route-service";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  runImportFilesChooseAction,
  runImportFilesRemoveAction,
} from "../services/import-files-action-flow-service";
import { getImportFilesActionState } from "../services/import-files-screen-state-service";
import { useImportSessionSelector } from "./use-import-session";

export function useImportFilesController() {
  const removeImportSongs = useImportSessionSelector(
    (store) => store.removeImportSongs,
  );
  const startFileImport = useImportSessionSelector(
    (store) => store.startFileImport,
  );
  const state = useImportSessionSelector((store) => store.state);
  const { sendHaptic } = useHapticFeedback();
  const actionState = getImportFilesActionState(state);

  const chooseFiles = useCallback(async () => {
    await runImportFilesChooseAction({
      navigate: pushNativeRoute,
      sendHaptic,
      startFileImport,
    });
  }, [sendHaptic, startFileImport]);

  const removeSong = useCallback(
    async (songId: number) => {
      await runImportFilesRemoveAction({
        removeImportSongs,
        sendHaptic,
        songId,
      });
    },
    [removeImportSongs, sendHaptic],
  );

  return {
    actionState,
    chooseFiles,
    removeSong,
    state,
  };
}

export type ImportFilesController = ReturnType<typeof useImportFilesController>;
