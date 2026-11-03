import { requireOptionalNativeModule } from "expo";

import { getPreference } from "~/features/preferences/store";

// Loaded optionally: a build without the module keeps working and simply
// skips feedback. Every call respects the Haptics preference.

interface HapticsModule {
  impactAsync: (
    style: "heavy" | "light" | "medium" | "rigid" | "soft",
  ) => Promise<void>;
  notificationAsync: (type: "error" | "success" | "warning") => Promise<void>;
  selectionAsync: () => Promise<void>;
}

const haptics = requireOptionalNativeModule<HapticsModule>("ExpoHaptics");

function enabled() {
  return haptics !== null && getPreference("haptics");
}

/** A firm tap, as when a long press opens a menu. */
export function impact() {
  if (enabled()) void haptics?.impactAsync("medium").catch(() => undefined);
}

/** A soft tap, as for play, pause, and skip. */
export function lightImpact() {
  if (enabled()) void haptics?.impactAsync("light").catch(() => undefined);
}

/** A light tick, as when a choice is made or a row is dropped. */
export function selectionTick() {
  if (enabled()) void haptics?.selectionAsync().catch(() => undefined);
}

/** Something was refused, as skipping past the end of the queue. */
export function errorFeedback() {
  if (enabled())
    void haptics?.notificationAsync("error").catch(() => undefined);
}

/** Something finished, as an import. */
export function successFeedback() {
  if (enabled())
    void haptics?.notificationAsync("success").catch(() => undefined);
}
