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

export type {
  SupportAction,
  SupportUrlAction,
} from "./settings-support-navigation-service";
export {
  getSupportActionKey,
  supportActions,
  supportReviewAction,
} from "./settings-support-navigation-service";

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
