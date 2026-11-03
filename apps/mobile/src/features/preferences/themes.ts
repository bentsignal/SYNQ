import { Uniwind } from "uniwind";

/**
 * SYNQ's accent colors, 2.5.2's pastel set with blue (the default) first.
 * `legacy` is the hex 2.5.2 stored for each, which the 2.5.2 importer maps
 * back to an id.
 */
export const THEMES = [
  { id: "blue", name: "Blue", accent: "#77adf8" },
  { id: "purple", name: "Purple", accent: "#a888ec" },
  { id: "pink", name: "Pink", accent: "#f6ace5" },
  { id: "red", name: "Red", accent: "#ff8585" },
  { id: "orange", name: "Orange", accent: "#efa28a" },
  { id: "yellow", name: "Yellow", accent: "#eddd92" },
  { id: "mint", name: "Mint", accent: "#61ae7f" },
] as const satisfies readonly { id: string; name: string; accent: string }[];

export type ThemeId = (typeof THEMES)[number]["id"];

export const DEFAULT_THEME = THEMES[0].id;

export function isThemeId(value: unknown): value is ThemeId {
  return THEMES.some((theme) => theme.id === value);
}

/** The theme 2.5.2 stored as a hex color, if it's one of its accents. */
export function themeFromLegacyColor(hex: string) {
  const normalized = hex.trim().toLowerCase();
  return THEMES.find((theme) => theme.accent === normalized)?.id;
}

export function themeAccent(id: ThemeId) {
  return (THEMES.find((theme) => theme.id === id) ?? THEMES[0]).accent;
}

/**
 * Swaps the accent for both of Uniwind's schemes (the app is always dark,
 * but Uniwind keeps both and needs them to agree).
 */
export function applyTheme(id: ThemeId) {
  const accent = themeAccent(id);
  for (const scheme of ["light", "dark"] as const) {
    Uniwind.updateCSSVariables(scheme, { "--color-accent": accent });
  }
}
