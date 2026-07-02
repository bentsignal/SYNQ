import { router } from "expo-router";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  getImportDiscardResultHref,
  getImportFinishResultHref,
} from "../services/import-navigation-service";
import type { ImportSessionState } from "../types/import-session";

type UseImportSaveSessionActionsParams = {
  discardSession: () => Promise<boolean>;
  saveImportSession: () => Promise<boolean>;
  setShouldSaveToLibrary: (shouldSaveToLibrary: boolean) => void;
  state: ImportSessionState;
};

export function useImportSaveSessionActions({
  discardSession,
  saveImportSession,
  setShouldSaveToLibrary,
  state,
}: UseImportSaveSessionActionsParams) {
  const { sendHaptic } = useHapticFeedback();

  const toggleShouldSaveToLibrary = () => {
    sendHaptic("light");
    setShouldSaveToLibrary(!state.shouldSaveToLibrary);
  };

  const finishImport = async () => {
    sendHaptic("medium");
    const succeeded = await saveImportSession();
    sendHaptic(succeeded ? "success" : "error");
    router.push(getImportFinishResultHref(succeeded));
  };

  const discardImport = async () => {
    sendHaptic("medium");
    const discarded = await discardSession();
    sendHaptic(discarded ? "success" : "error");
    router.push(getImportDiscardResultHref(discarded));
  };

  return {
    discardImport,
    finishImport,
    toggleShouldSaveToLibrary,
  };
}
