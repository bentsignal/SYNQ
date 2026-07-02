import type {
  CustomizationColorKey,
  CustomizationSettingsStatus,
} from "../types/customization-settings";
import type { PrivacySettingsStatus } from "../types/privacy-settings";

export type SettingsRoute = {
  description: string;
  href:
    | "/(tabs)/settings"
    | "/premium"
    | "/(tabs)/settings/backup"
    | "/(tabs)/settings/customization"
    | "/(tabs)/settings/privacy"
    | "/(tabs)/settings/support";
  label: string;
};

export type SettingsHomeHref = "/(tabs)/settings";
export type SettingsPremiumHref = "/premium";

export const getSettingsHomeHref = (): SettingsHomeHref =>
  "/(tabs)/settings";

export const getSettingsPremiumHref = (): SettingsPremiumHref => "/premium";

export const getSettingsBackLink = () => ({
  href: getSettingsHomeHref(),
  label: "Back to Settings",
});

export type SupportAction = {
  description: string;
  label: string;
  url: string;
};

export const settingsRoutes: SettingsRoute[] = [
  {
    description: "Unlock and manage the full SYNQ experience.",
    href: getSettingsPremiumHref(),
    label: "Premium",
  },
  {
    description: "Theme, app icon, haptics, and interface preferences.",
    href: "/(tabs)/settings/customization",
    label: "Customization",
  },
  {
    description: "Archive, restore, or reset the local music library.",
    href: "/(tabs)/settings/backup",
    label: "Backup & Restore",
  },
  {
    description: "Analytics and local privacy preferences.",
    href: "/(tabs)/settings/privacy",
    label: "Privacy",
  },
  {
    description: "Help, feedback, and community links.",
    href: "/(tabs)/settings/support",
    label: "Support",
  },
];

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

export const shouldSendHapticForHapticsToggle = ({
  hapticsEnabled,
}: {
  hapticsEnabled: boolean;
}) => hapticsEnabled;

export const getCustomizationSettingsErrorMessage = (caughtError: unknown) =>
  caughtError instanceof Error
    ? caughtError.message
    : "Customization settings failed.";

export const getPrivacySettingsErrorMessage = (caughtError: unknown) =>
  caughtError instanceof Error
    ? caughtError.message
    : "Privacy settings failed.";
