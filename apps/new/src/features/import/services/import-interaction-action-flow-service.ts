import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import { getImportHomeRouteSelectCommand } from "./import-home-screen-state-service";
import { getImportPremiumGateActionCommand } from "./import-premium-gate-state-service";

type HapticSender = (type: HapticFeedbackType) => void;

export const runImportHomeRouteSelectAction = ({
  sendHaptic,
}: {
  sendHaptic: HapticSender;
}) => {
  sendHaptic(getImportHomeRouteSelectCommand().haptic);
};

export const runImportPremiumGateAction = ({
  sendHaptic,
}: {
  sendHaptic: HapticSender;
}) => {
  sendHaptic(getImportPremiumGateActionCommand().haptic);
};
