import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import type { ImportSessionState } from "../types/import-session";
import { getPremiumScopedImportSongs } from "./import-premium-access-service";
import {
  getImportSaveExportFailureCommand,
  getImportSaveExportSuccessCommand,
} from "./import-save-export-command-state-service";
import {
  getImportSaveExportBeginAction,
  getImportSaveExportFinishAction,
  type ImportSaveExportAction,
} from "./import-save-export-state-service";

export const runImportSaveExportAction = async ({
  dispatch,
  premiumActive,
  sendHaptic,
  shareImportDraftSongs,
  state,
}: {
  dispatch: (action: ImportSaveExportAction) => void;
  premiumActive: boolean;
  sendHaptic: (type: HapticFeedbackType) => void;
  shareImportDraftSongs: (
    songs: ImportSessionState["songs"],
  ) => Promise<unknown>;
  state: Pick<ImportSessionState, "songs">;
}) => {
  dispatch(getImportSaveExportBeginAction());

  try {
    await shareImportDraftSongs(
      getPremiumScopedImportSongs({
        premiumActive,
        songs: state.songs,
      }),
    );
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
