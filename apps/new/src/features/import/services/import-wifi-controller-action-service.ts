import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import {
  runImportWifiRemoveSongAction,
  runImportWifiReviewSaveAction,
} from "./import-wifi-action-flow-service";

type CreateImportWifiControllerActionsParams = {
  canRemoveSongs: boolean;
  removeImportSongs: (songIds: number[]) => Promise<boolean>;
  sendHaptic: (type: HapticFeedbackType) => void;
};

export type ImportWifiControllerActions = {
  removeSong: (songId: number) => Promise<void>;
  reviewSave: () => void;
};

export const createImportWifiControllerActions = ({
  canRemoveSongs,
  removeImportSongs,
  sendHaptic,
}: CreateImportWifiControllerActionsParams): ImportWifiControllerActions => ({
  removeSong: (songId) =>
    runImportWifiRemoveSongAction({
      canRemoveSongs,
      removeImportSongs,
      sendHaptic,
      songId,
    }),
  reviewSave: () => {
    runImportWifiReviewSaveAction({ sendHaptic });
  },
});
