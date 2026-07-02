import { useState } from "react";
import { router } from "expo-router";
import { shareImportDraftSongs } from "@/src/features/export/services/import-draft-export-service";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { getImportSaveActionState } from "../services/import-session-state-service";
import type { ImportSessionState } from "../types/import-session";

type UseImportSaveControllerParams = {
  discardSession: () => Promise<boolean>;
  saveImportSession: () => Promise<boolean>;
  setShouldSaveToLibrary: (shouldSaveToLibrary: boolean) => void;
  state: ImportSessionState;
};

export function useImportSaveController({
  discardSession,
  saveImportSession,
  setShouldSaveToLibrary,
  state,
}: UseImportSaveControllerParams) {
  const { sendHaptic } = useHapticFeedback();
  const [exportError, setExportError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const actionState = getImportSaveActionState({
    isExporting,
    state,
  });

  const toggleShouldSaveToLibrary = () => {
    sendHaptic("light");
    setShouldSaveToLibrary(!state.shouldSaveToLibrary);
  };

  const exportSongs = async () => {
    setExportError(null);
    setIsExporting(true);

    try {
      await shareImportDraftSongs(state.songs);
      sendHaptic("success");
    } catch (caughtError) {
      sendHaptic("error");
      setExportError(
        caughtError instanceof Error
          ? caughtError.message
          : "Staged songs could not be exported.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  const finishImport = async () => {
    sendHaptic("medium");
    const succeeded = await saveImportSession();
    sendHaptic(succeeded ? "success" : "error");
    router.push(succeeded ? "/(tabs)/import/success" : "/(tabs)/import/failure");
  };

  const discardImport = async () => {
    sendHaptic("medium");
    const discarded = await discardSession();
    sendHaptic(discarded ? "success" : "error");
    router.push(discarded ? "/(tabs)/import" : "/(tabs)/import/failure");
  };

  return {
    actionState,
    discardImport,
    exportError,
    exportSongs,
    finishImport,
    toggleShouldSaveToLibrary,
  };
}

export type ImportSaveController = ReturnType<typeof useImportSaveController>;
