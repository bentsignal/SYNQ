import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import { getImportWifiReviewSaveHaptic } from "./import-wifi-screen-state-service";

export const runImportWifiReviewSaveAction = ({
  sendHaptic,
}: {
  sendHaptic: (type: HapticFeedbackType) => void;
}) => {
  sendHaptic(getImportWifiReviewSaveHaptic());
};
