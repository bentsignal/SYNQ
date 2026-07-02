import { getAppIcon, setAppIcon } from "expo-icon-handler";
import type { CustomizationColorKey } from "../types/customization-settings";

const nativeIconNames = {
  blue: "icon-blue",
  mint: "icon-mint",
  orange: "icon-orange",
  pink: "icon-pink",
  purple: "icon-purple",
  red: "icon-red",
  yellow: "icon-yellow",
} satisfies Record<CustomizationColorKey, string>;

export function getNativeAppIconName(key: CustomizationColorKey) {
  return nativeIconNames[key];
}

export function setNativeAppIcon(key: CustomizationColorKey) {
  const nextIconName = getNativeAppIconName(key);
  const currentIconName = getAppIcon();
  const blueIconAlreadyActive =
    key === "blue" &&
    (currentIconName === "default" || currentIconName === "DEFAULT");

  if (currentIconName === nextIconName || blueIconAlreadyActive) {
    return;
  }

  setAppIcon(nextIconName);
}
