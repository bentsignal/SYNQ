import { requireOptionalNativeModule } from "expo";

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

/** The alternate icon in use, or null for the primary icon. */
export function currentAppIcon() {
  return native?.getAppIconName() ?? null;
}

/** Switches the home screen icon; iOS shows its own confirmation. */
export function setAppIcon(name: AppIconName) {
  if (native === null) return Promise.resolve(null);
  return native.setAlternateAppIcon(name);
}
