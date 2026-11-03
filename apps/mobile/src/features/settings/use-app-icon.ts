import { useSyncExternalStore } from "react";
import { Alert } from "react-native";
import Constants from "expo-constants";

import type { AppIconName } from "~/features/app-icon/app-icon";
import { track } from "~/features/analytics/analytics";
import {
  APP_ICONS,
  appIconsAvailable,
  currentAppIcon,
  setAppIcon,
  subscribeAppIcon,
} from "~/features/app-icon/app-icon";
import { selectionTick } from "~/lib/haptics";

/**
 * SYNQ's primary icon is `icon-blue`, so no alternate means blue. SYNQ Dev's
 * primary is its amber icon, which isn't one of the choices.
 */
const PRIMARY =
  Constants.expoConfig?.scheme === "synq" ? APP_ICONS[0].name : null;

function snapshot() {
  const name = currentAppIcon();
  return APP_ICONS.find((icon) => icon.name === name)?.name ?? PRIMARY;
}

/**
 * Switches the home screen icon. It shows as chosen at once; iOS confirms
 * with its own alert. iOS keeps the choice (by its 2.5.2 name), so it isn't
 * a saved preference.
 */
export function chooseAppIcon(name: AppIconName) {
  const previous = snapshot();
  if (name === previous) return;
  selectionTick();
  track("app_icon_change", {
    icon: APP_ICONS.find((icon) => icon.name === name)?.label ?? name,
  });
  // It reads as chosen at once, and goes back if iOS refuses.
  setAppIcon(name).catch(() => {
    Alert.alert("Couldn't Change App Icon", "Try again.");
  });
}

/** The home screen icon, and whether this build can switch it. */
export function useAppIcon() {
  return {
    available: appIconsAvailable(),
    current: useSyncExternalStore(subscribeAppIcon, snapshot),
  };
}
