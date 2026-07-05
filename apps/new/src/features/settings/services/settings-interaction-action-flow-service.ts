import type { HapticFeedbackType } from "./haptic-feedback-service";
import {
  getCustomizationHapticsToggleCommand,
  getSettingsHapticCommand,
} from "./settings-haptic-command-service";

type HapticSender = (type: HapticFeedbackType) => void;

export const runSettingsInteractionAction = ({
  action,
  sendHaptic,
}: {
  action: () => unknown;
  sendHaptic: HapticSender;
}) => {
  sendHaptic(getSettingsHapticCommand().haptic);
  return action();
};

export const runCustomizationHapticsToggleAction = ({
  currentHapticsEnabled,
  nextHapticsEnabled,
  sendHaptic,
  setHapticsEnabled,
}: {
  currentHapticsEnabled: boolean;
  nextHapticsEnabled: boolean;
  sendHaptic: HapticSender;
  setHapticsEnabled: (hapticsEnabled: boolean) => unknown;
}) => {
  const command = getCustomizationHapticsToggleCommand({
    hapticsEnabled: currentHapticsEnabled,
  });

  if (command) {
    sendHaptic(command.haptic);
  }

  return setHapticsEnabled(nextHapticsEnabled);
};
