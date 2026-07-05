import { useMemo } from "react";
import { pushNativeRoute } from "@/src/features/app-shell/services/native-route-service";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  createImportFilesControllerActions,
} from "../services/import-files-controller-action-service";
import { getImportFilesViewState } from "../services/import-files-view-state-service";
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
  const viewState = getImportFilesViewState(state);

  const { chooseFiles, removeSong } = useMemo(
    () =>
      createImportFilesControllerActions({
        navigate: pushNativeRoute,
        removeImportSongs,
        sendHaptic,
        startFileImport,
      }),
    [removeImportSongs, sendHaptic, startFileImport],
  );

  return {
    chooseFiles,
    removeSong,
    state,
    viewState,
  };
}

export type ImportFilesController = ReturnType<typeof useImportFilesController>;
