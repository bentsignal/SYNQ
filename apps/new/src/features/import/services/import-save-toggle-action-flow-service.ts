import type { ImportSaveSessionActionDependencies } from "./import-save-session-action-flow-service";
import { getImportSaveToggleCommand } from "./import-save-session-command-service";
import type { ImportSessionState } from "../types/import-session";

export const runImportSaveToggleAction = ({
  sendHaptic,
  setShouldSaveToLibrary,
  state,
}: Pick<ImportSaveSessionActionDependencies, "sendHaptic"> & {
  setShouldSaveToLibrary: (shouldSaveToLibrary: boolean) => void;
  state: Pick<ImportSessionState, "shouldSaveToLibrary">;
}) => {
  const command = getImportSaveToggleCommand(state);
  sendHaptic(command.haptic);
  setShouldSaveToLibrary(command.shouldSaveToLibrary);
};
