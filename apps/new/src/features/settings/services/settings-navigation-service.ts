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

export type SupportAction =
  | {
      description: string;
      label: string;
      type: "review";
    }
  | {
      description: string;
      label: string;
      type: "url";
      url: string;
    };

export type SupportUrlAction = Extract<SupportAction, { type: "url" }>;

export const getSupportActionKey = (action: SupportAction) =>
  action.type === "url" ? action.url : action.type;

export const supportReviewAction: SupportAction = {
  description: "Open the App Store review prompt when it is available.",
  label: "Leave a Review",
  type: "review",
};

const supportUrlAction = ({
  description,
  label,
  url,
}: {
  description: string;
  label: string;
  url: string;
}): SupportUrlAction => ({
  description,
  label,
  type: "url",
  url,
});

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
  supportReviewAction,
  supportUrlAction({
    description: "Open the SYNQ support page in your browser.",
    label: "Contact Support",
    url: "https://directedbyshawn.com/synq-support",
  }),
  supportUrlAction({
    description: "Follow project updates and release notes.",
    label: "X",
    url: "https://x.com/SYNQ_cc",
  }),
  supportUrlAction({
    description: "See design and app progress posts.",
    label: "Instagram",
    url: "https://instagram.com/synq.cc",
  }),
  supportUrlAction({
    description: "Join the community and report issues directly.",
    label: "Discord",
    url: "https://discord.gg/KwC24St29g",
  }),
];
