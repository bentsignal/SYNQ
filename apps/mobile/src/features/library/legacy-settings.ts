import type { LegacySettings } from "@synq/db/legacy";

import { replacePreferences } from "~/features/preferences/store";
import { themeFromLegacyColor } from "~/features/preferences/themes";
import { readJson, writeJson } from "~/lib/kv";

/** The import whose settings are already applied, so they apply once. */
const APPLIED_KEY = "synq.legacy-import-applied";
/**
 * 2.5.2's playback session and bookkeeping, waiting for the features that
 * own them (player, review) to take them on their first start. 2.5.2's
 * premium status and ad counter aren't kept: 3.0 is free, with no ad.
 */
const PENDING_KEY = "synq.legacy-settings";

/**
 * Applies a 2.5.2 install's settings once per import: preferences now, the
 * rest left for their features (`takeLegacySettings`).
 */
export function applyLegacySettings(
  importId: number,
  settings: LegacySettings | null,
) {
  if (readJson(APPLIED_KEY, (stored) => stored) === importId) return;
  if (settings !== null) {
    replacePreferences({
      haptics: settings.preferences.haptics,
      theme:
        (settings.preferences.accent === null
          ? undefined
          : themeFromLegacyColor(settings.preferences.accent)) ?? "blue",
    });
    writeJson(PENDING_KEY, settings);
  }
  writeJson(APPLIED_KEY, importId);
}

/**
 * The 2.5.2 settings still waiting for the feature that owns `part`, removed
 * as it's read so it's taken once. Null when there's nothing (a fresh
 * install, or already taken).
 */
export function takeLegacySettings<Part extends keyof LegacySettings>(
  part: Part,
) {
  const pending = readJson(PENDING_KEY, (stored) =>
    typeof stored === "object" && stored !== null ? stored : null,
  );
  if (pending === null || !(part in pending)) return null;
  const value = Reflect.get(pending, part);
  const rest = { ...pending };
  Reflect.deleteProperty(rest, part);
  writeJson(PENDING_KEY, rest);
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Written by applyLegacySettings from the importer's typed LegacySettings in this same store.
  return value as LegacySettings[Part];
}
