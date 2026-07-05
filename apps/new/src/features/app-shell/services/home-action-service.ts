export type HomeHref =
  | "/premium"
  | "/player"
  | "/queue"
  | "/(tabs)/import"
  | "/(tabs)/import/files"
  | "/(tabs)/import/wifi"
  | "/(tabs)/library"
  | "/(tabs)/settings"
  | `/(tabs)/library/song/${number}`;

export type HomeAction = {
  detail: string;
  href: HomeHref;
  label: string;
};

export const getHomeQuickActions = ({
  songCount,
}: {
  songCount: number;
}): HomeAction[] => [
  {
    detail: `${songCount} songs`,
    href: "/(tabs)/library",
    label: "Library",
  },
  {
    detail: "Import from files",
    href: "/(tabs)/import/files",
    label: "Files",
  },
  {
    detail: "Import from computer",
    href: "/(tabs)/import/wifi",
    label: "Wi-Fi",
  },
  {
    detail: "Theme and backup",
    href: "/(tabs)/settings",
    label: "Settings",
  },
  {
    detail: "Unlock listening",
    href: "/premium",
    label: "Premium",
  },
];
