import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import type { ImportSessionState } from "../types/import-session";
import {
  getImportSaveExportBeginAction,
  getImportSaveExportFailureCommand,
  getImportSaveExportFinishAction,
  getImportSaveExportSuccessCommand,
  type ImportSaveExportAction,
} from "./import-save-export-state-service";

export const runImportSaveExportAction = async ({
  dispatch,
  sendHaptic,
  shareImportDraftSongs,
  state,
}: {
  dispatch: (action: ImportSaveExportAction) => void;
  sendHaptic: (type: HapticFeedbackType) => void;
  shareImportDraftSongs: (
    songs: ImportSessionState["songs"],
  ) => Promise<unknown>;
  state: Pick<ImportSessionState, "songs">;
}) => {
  dispatch(getImportSaveExportBeginAction());

  try {
    await shareImportDraftSongs(state.songs);
    const command = getImportSaveExportSuccessCommand();
    sendHaptic(command.haptic);
  } catch (caughtError) {
    const command = getImportSaveExportFailureCommand(caughtError);
    sendHaptic(command.haptic);
    if (command.action) {
      dispatch(command.action);
    }
  } finally {
    dispatch(getImportSaveExportFinishAction());
  }
};
