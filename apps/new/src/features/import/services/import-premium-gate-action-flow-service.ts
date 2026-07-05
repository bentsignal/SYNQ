import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import { getImportPremiumGateActionCommand } from "./import-premium-gate-state-service";

type HapticSender = (type: HapticFeedbackType) => void;

export const runImportPremiumGateAction = ({
  sendHaptic,
}: {
  sendHaptic: HapticSender;
}) => {
  sendHaptic(getImportPremiumGateActionCommand().haptic);
};
