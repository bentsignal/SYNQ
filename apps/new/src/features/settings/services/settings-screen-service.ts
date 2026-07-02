import type {
  CustomizationColorKey,
  CustomizationSettingsStatus,
} from "../types/customization-settings";
import type { PrivacySettingsStatus } from "../types/privacy-settings";

export type SupportAction = {
  description: string;
  label: string;
  url: string;
};

export const supportActions: SupportAction[] = [
  {
    description: "Open the SYNQ support page in your browser.",
    label: "Contact Support",
    url: "https://directedbyshawn.com/synq-support",
  },
  {
    description: "Follow project updates and release notes.",
    label: "X",
    url: "https://x.com/SYNQ_cc",
  },
  {
    description: "See design and app progress posts.",
    label: "Instagram",
    url: "https://instagram.com/synq.cc",
  },
  {
    description: "Join the community and report issues directly.",
    label: "Discord",
    url: "https://discord.gg/KwC24St29g",
  },
];

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
