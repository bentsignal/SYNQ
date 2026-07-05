import type { HapticFeedbackType } from "./haptic-feedback-service";

type SettingsHapticCommand = {
  haptic: HapticFeedbackType;
};

export const getSettingsHapticCommand = (): SettingsHapticCommand => ({
  haptic: "light",
});

export const shouldSendHapticForHapticsToggle = ({
  hapticsEnabled,
}: {
  hapticsEnabled: boolean;
}) => hapticsEnabled;

export const getCustomizationHapticsToggleCommand = ({
  hapticsEnabled,
}: {
  hapticsEnabled: boolean;
}): SettingsHapticCommand | null =>
  shouldSendHapticForHapticsToggle({ hapticsEnabled })
    ? getSettingsHapticCommand()
    : null;
