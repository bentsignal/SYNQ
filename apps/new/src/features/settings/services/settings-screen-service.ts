import type {
  CustomizationColorKey,
  CustomizationSettingsStatus,
} from "../types/customization-settings";
import type { PrivacySettingsStatus } from "../types/privacy-settings";

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

export const shouldSendHapticForHapticsToggle = ({
  hapticsEnabled,
}: {
  hapticsEnabled: boolean;
}) => hapticsEnabled;
