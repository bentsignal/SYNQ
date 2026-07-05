import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import { runImportSaveRemoveSongAction } from "./import-save-song-action-flow-service";

type CreateImportSaveControllerActionsParams = {
  canRemoveSongs: boolean;
  removeImportSongs: (songIds: number[]) => Promise<boolean>;
  sendHaptic: (type: HapticFeedbackType) => void;
};

export type ImportSaveControllerActions = {
  removeSong: (songId: number) => Promise<void>;
};

export const createImportSaveControllerActions = ({
  canRemoveSongs,
  removeImportSongs,
  sendHaptic,
}: CreateImportSaveControllerActionsParams): ImportSaveControllerActions => ({
  removeSong: (songId) =>
    runImportSaveRemoveSongAction({
      canRemoveSongs,
      removeImportSongs,
      sendHaptic,
      songId,
    }),
});
