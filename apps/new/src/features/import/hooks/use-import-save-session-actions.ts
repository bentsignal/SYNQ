import { pushNativeRoute } from "@/src/features/app-shell/services/native-route-service";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  getImportDiscardResultCommand,
  getImportFinishResultCommand,
  getImportSaveSessionStartHaptic,
  getImportSaveToggleCommand,
} from "../services/import-save-session-command-service";
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
    const command = getImportSaveToggleCommand(state);
    sendHaptic(command.haptic);
    setShouldSaveToLibrary(command.shouldSaveToLibrary);
  };

  const finishImport = async () => {
    sendHaptic(getImportSaveSessionStartHaptic());
    const succeeded = await saveImportSession();
    const command = getImportFinishResultCommand(succeeded);
    sendHaptic(command.haptic);
    pushNativeRoute(command.href);
  };

  const discardImport = async () => {
    sendHaptic(getImportSaveSessionStartHaptic());
    const discarded = await discardSession();
    const command = getImportDiscardResultCommand(discarded);
    sendHaptic(command.haptic);
    pushNativeRoute(command.href);
  };

  return {
    discardImport,
    finishImport,
    toggleShouldSaveToLibrary,
  };
}
