import type { Href } from "expo-router";

export type SettingsScreenHeaderState = {
  kicker: string;
  statusLabel?: string;
  subtitle: string;
  title: string;
};

export type SettingsInfoPanelState = {
  body: string;
  title: string;
};

export type SettingsBackLinkState = {
  href: Href;
  label: string;
};

