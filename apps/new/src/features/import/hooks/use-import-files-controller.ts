import { router } from "expo-router";
import { useCallback } from "react";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { getImportFilesActionState } from "../services/import-files-screen-state-service";
import { getImportFilesResultHref } from "../services/import-navigation-service";
import { useImportSession } from "./use-import-session";

export function useImportFilesController() {
  const { removeImportSongs, startFileImport, state } = useImportSession();
  const { sendHaptic } = useHapticFeedback();
  const actionState = getImportFilesActionState(state);

  const chooseFiles = useCallback(async () => {
    sendHaptic("light");
    const staged = await startFileImport();

    sendHaptic(staged ? "success" : "error");
    router.push(getImportFilesResultHref(staged));
  }, [sendHaptic, startFileImport]);

  const removeSong = useCallback(
    async (songId: number) => {
      sendHaptic("medium");
      const removed = await removeImportSongs([songId]);

      sendHaptic(removed ? "success" : "error");
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
