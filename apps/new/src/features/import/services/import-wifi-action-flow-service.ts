import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import { runImportFilesRemoveAction } from "./import-files-action-flow-service";
import { getImportWifiReviewSaveHaptic } from "./import-wifi-action-state-service";

export const runImportWifiRemoveSongAction = async ({
  canRemoveSongs,
  removeImportSongs,
  sendHaptic,
  songId,
}: {
  canRemoveSongs: boolean;
  removeImportSongs: (songIds: number[]) => Promise<boolean>;
  sendHaptic: (type: HapticFeedbackType) => void;
  songId: number;
}) => {
  if (!canRemoveSongs) {
    return;
  }

  await runImportFilesRemoveAction({
    removeImportSongs,
    sendHaptic,
    songId,
  });
};

export const runImportWifiReviewSaveAction = ({
  sendHaptic,
}: {
  sendHaptic: (type: HapticFeedbackType) => void;
}) => {
  sendHaptic(getImportWifiReviewSaveHaptic());
};
