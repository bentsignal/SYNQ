import { requireOptionalNativeModule } from "expo";

import { createIconState } from "./icon-state";

/** The native side of `expo-alternate-app-icons`. */
interface AlternateIconsModule {
  readonly supportsAlternateIcons: boolean;
  getAppIconName: () => string | null;
  setAlternateAppIcon: (name: string | null) => Promise<string | null>;
}

// Optional, so a build without the module keeps running; it just doesn't
// offer icon choices.
const native = requireOptionalNativeModule<AlternateIconsModule>(
  "ExpoAlternateAppIcons",
);

/**
 * The home screen icons, by their iOS alternate icon names. These are
 * 2.5.2's names, and iOS remembers someone's pick by name, so they never
 * change (app.config.ts registers the same list). `icon-blue` is also the
 * primary icon, so 2.5.2 users who never picked one see it as their choice.
 */
export const APP_ICONS = [
  { name: "icon-blue", label: "Blue" },
  { name: "icon-purple", label: "Purple" },
  { name: "icon-pink", label: "Pink" },
  { name: "icon-red", label: "Red" },
  { name: "icon-orange", label: "Orange" },
  { name: "icon-yellow", label: "Yellow" },
  { name: "icon-mint", label: "Mint" },
] as const;

export type AppIconName = (typeof APP_ICONS)[number]["name"];

/** Whether this build and device can switch icons. */
export function appIconsAvailable() {
  return native?.supportsAlternateIcons === true;
}

// Native is asked for the icon once; see icon-state.ts for why.
const icon = createIconState(native);

/** The alternate icon in use (or being switched to), or null for the primary icon. */
export function currentAppIcon() {
  return icon.get();
}

/** Switches the home screen icon; iOS shows its own confirmation. */
export function setAppIcon(name: AppIconName) {
  return icon.set(name);
}

/** Calls `listener` when the icon changes (here or from premium); returns an unsubscribe. */
export function subscribeAppIcon(listener: () => void) {
  return icon.subscribe(listener);
}
