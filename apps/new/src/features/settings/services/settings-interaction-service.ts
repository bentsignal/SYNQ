import type { HapticFeedbackType } from "./haptic-feedback-service";

type SettingsInteractionCommand = {
  haptic: HapticFeedbackType;
};

export const getSettingsInteractionCommand = (): SettingsInteractionCommand => ({
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
}): SettingsInteractionCommand | null =>
  shouldSendHapticForHapticsToggle({ hapticsEnabled })
    ? getSettingsInteractionCommand()
    : null;
