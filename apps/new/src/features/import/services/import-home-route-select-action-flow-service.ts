import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import { getImportHomeRouteSelectCommand } from "./import-home-action-state-service";

type HapticSender = (type: HapticFeedbackType) => void;

export const runImportHomeRouteSelectAction = ({
  sendHaptic,
}: {
  sendHaptic: HapticSender;
}) => {
  sendHaptic(getImportHomeRouteSelectCommand().haptic);
};
