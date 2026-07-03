import type {
  CustomizationColorKey,
  CustomizationSettingsStatus,
} from "../types/customization-settings";
import type { HapticFeedbackType } from "./haptic-feedback-service";
import type { PrivacySettingsStatus } from "../types/privacy-settings";
import { getSettingsBackLink } from "./settings-navigation-service";

export const getPrivacyScreenViewState = () => ({
  backLink: getSettingsBackLink(),
  header: {
    kicker: "Preferences",
    subtitle: "Control local preferences for analytics and diagnostics.",
    title: "Privacy",
  },
  localFirstPanel: {
    body:
      "Your library, imports, backups, theme, and privacy preferences are stored on this device unless you choose to export or restore them.",
    title: "Local-first by default",
  },
  preference: {
    description:
      "Allow anonymous usage signals to help prioritize reliability and feature work.",
    title: "Analytics",
  },
});

export const getSupportScreenViewState = () => ({
  backLink: getSettingsBackLink(),
  bugReportPanel: {
    body:
      "Include your device model, iOS or Android version, what you tapped before the issue, and whether the song file lives locally on-device.",
    title: "Before you send a bug",
  },
  header: {
    kicker: "Help",
    subtitle: "Get help, send feedback, or follow along with the project.",
    title: "Support",
  },
});

export const getPrivacyScreenState = ({
  status,
}: {
  status: PrivacySettingsStatus;
}) => ({
  isAnalyticsDisabled: status === "loading",
  statusLabel:
    status === "loading"
      ? "Loading"
      : status === "saving"
        ? "Saving"
        : "Saved locally",
});

export const getSettingsHomeState = ({
  premiumActive,
}: {
  premiumActive: boolean;
}) => ({
  premiumStatusLabel: premiumActive ? "Premium active" : "Premium inactive",
});

export const getCustomizationScreenState = ({
  premiumActive,
  status,
}: {
  premiumActive: boolean;
  status: CustomizationSettingsStatus;
}) => ({
  hapticsDisabled: status === "loading",
  showPremiumPanel: !premiumActive,
  statusLabel: status === "saving" ? "Saving" : "Preferences saved locally",
  themeControlsDisabled: !premiumActive || status === "loading",
});

export const getCustomizationOptionState = ({
  disabled,
  optionKey,
  selectedKey,
}: {
  disabled: boolean;
  optionKey: CustomizationColorKey;
  selectedKey: CustomizationColorKey;
}) => ({
  accessibilityState: {
    disabled,
    selected: optionKey === selectedKey,
  },
  isSelected: optionKey === selectedKey,
});

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

export const getCustomizationSettingsErrorMessage = (caughtError: unknown) =>
  caughtError instanceof Error
    ? caughtError.message
    : "Customization settings failed.";

export const getPrivacySettingsErrorMessage = (caughtError: unknown) =>
  caughtError instanceof Error
    ? caughtError.message
    : "Privacy settings failed.";
