import { router } from "expo-router";
import { useCallback } from "react";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  getImportFileRemovalResultCommand,
  getImportFileRemovalStartHaptic,
  getImportFileSelectionResultCommand,
  getImportFileSelectionStartHaptic,
} from "../services/import-file-command-service";
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
    sendHaptic(getImportFileSelectionStartHaptic());
    const staged = await startFileImport();
    const command = getImportFileSelectionResultCommand(staged);

    sendHaptic(command.haptic);
    router.push(command.href);
  }, [sendHaptic, startFileImport]);

  const removeSong = useCallback(
    async (songId: number) => {
      sendHaptic(getImportFileRemovalStartHaptic());
      const removed = await removeImportSongs([songId]);
      const command = getImportFileRemovalResultCommand(removed);

      sendHaptic(command.haptic);
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
