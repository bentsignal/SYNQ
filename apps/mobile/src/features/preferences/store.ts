import { useSyncExternalStore } from "react";

import type { ThemeId } from "./themes";
import { readJson, writeJson } from "~/lib/kv";
import { applyTheme, DEFAULT_THEME, isThemeId } from "./themes";

const STORAGE_KEY = "synq.preferences";

export interface Preferences {
  /** The accent color. Themes other than blue are a Premium feature. */
  readonly theme: ThemeId;
  /** Taps and toggles give haptic feedback. */
  readonly haptics: boolean;
}

const DEFAULTS = {
  theme: DEFAULT_THEME,
  haptics: true,
} satisfies Preferences;

function themeOr(value: unknown, fallback: ThemeId) {
  return isThemeId(value) ? value : fallback;
}

function booleanOr(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

/** Stored values checked field by field, so a bad value can't crash launch. */
export function preferencesFrom(stored: unknown) {
  if (typeof stored !== "object" || stored === null) return DEFAULTS;
  return {
    theme: themeOr(Reflect.get(stored, "theme"), DEFAULTS.theme),
    haptics: booleanOr(Reflect.get(stored, "haptics"), DEFAULTS.haptics),
  } satisfies Preferences;
}

let current = readJson(STORAGE_KEY, preferencesFrom);
const listeners = new Set<() => void>();

/** Applies saved preferences; call once before the first render. */
export function applyStoredPreferences() {
  applyTheme(current.theme);
}

/** Replaces every preference at once (the 2.5.2 import, a restore). */
export function replacePreferences(next: Preferences) {
  current = next;
  writeJson(STORAGE_KEY, current);
  applyTheme(current.theme);
  for (const listener of listeners) listener();
}

export function setPreference<Key extends keyof Preferences>(
  key: Key,
  value: Preferences[Key],
) {
  replacePreferences({ ...current, [key]: value });
}

/** The current value outside React (haptics, playback setup). */
export function getPreference<Key extends keyof Preferences>(key: Key) {
  return current[key];
}

export function usePreference<Key extends keyof Preferences>(key: Key) {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => current[key],
  );
}
