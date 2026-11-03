/**
 * Experiments in choosing the player's colors, switchable on the phone. See
 * "Backdrop experiments" in this folder's README. The winner replaces
 * `backdropPalette`, and the rest go.
 */
import type { Lead } from "./backdrop-families.ts";
import type {
  ArtworkCluster,
  BackdropSwatch,
  Seen,
} from "./backdrop-palette.ts";
import {
  darknessOf,
  familiesOf,
  glowLightness,
  rescueHue,
  shadowHue,
  toSwatch,
  vivid,
} from "./backdrop-families.ts";
import {
  backdropPalette,
  clamp,
  hueDistance,
  MAX_LUMINANCE,
  read,
  toneStops,
} from "./backdrop-palette.ts";

export interface BackdropLook {
  falloff: number;
  oklab: boolean;
  saturation: number;
  restore: number;
}

export interface BackdropDesign {
  swatches: BackdropSwatch[];
  look: BackdropLook;
}

export interface ArtworkColors {
  clusters: readonly ArtworkCluster[];
}

export const ORIGINAL_LOOK = {
  falloff: 1.5,
  oklab: false,
  restore: 0,
  saturation: 1,
} satisfies BackdropLook;

/** What each version of Family changes. */
interface Tuning {
  /** Multiplies every color's chroma. */
  chroma: number;
  /** The most chroma any color may have. */
  ceiling: number;
  /** Multiplies how far shadows lean toward violet, and the glow's lean. */
  lean: number;
  /** Added to every color's lightness. */
  lift: number;
  /** The brightest any color may be, since most covers' top colors reach it. */
  maxLuminance: number;
  /** Takes chroma from how vivid the cover is, not from what the screen can show. */
  matched: boolean;
}

const BASE_TUNING = {
  ceiling: 0.16,
  chroma: 1,
  lean: 1,
  lift: 0,
  matched: false,
  maxLuminance: MAX_LUMINANCE,
} satisfies Tuning;

/**
 * One hue family, from a deep ground up to a glow, each step rotated a little
 * the way light does. No second hue, so nothing can clash, and lightness does
 * the work that competing hues did.
 */
function familySwatches(
  lead: Lead,
  seen: readonly Seen[],
  flip: boolean,
  tuning: Tuning,
) {
  const { ceiling, chroma, lean, lift, matched, maxLuminance } = tuning;
  const dark = darknessOf(seen);
  const hue = rescueHue(lead.h, lead.l);
  // A cover with faint color gets a faint backdrop, not an invented vivid one.
  const share =
    chroma *
    (matched ? clamp(lead.c / 0.2, 0.45, 0.9) : clamp(lead.c / 0.09, 0.65, 1));
  const top = glowLightness(dark) + lift;
  const ground = Math.max(0.09, 0.13 + (1 - dark) * 0.12 + lift);
  function x(at: number) {
    return flip ? 1 - at : at;
  }
  function color(l: number, h: number, amount: number) {
    return vivid(l, h, share * amount, ceiling);
  }
  return [
    toSwatch(color(ground, shadowHue(hue, 0.5 * lean), 0.85), {
      maxLuminance,
      weight: 1.2,
      x: x(0.92),
      y: 1.02,
    }),
    toSwatch(color(ground + 0.07, shadowHue(hue, 0.35 * lean), 0.85), {
      maxLuminance,
      x: x(0.05),
      y: 0.82,
    }),
    toSwatch(color(top - 0.14, shadowHue(hue, 0.15 * lean), 0.9), {
      maxLuminance,
      x: x(0.9),
      y: 0.5,
    }),
    toSwatch(color(top - 0.04, hue, 0.9), {
      maxLuminance,
      x: x(0.04),
      y: 0.36,
    }),
    toSwatch(color(top, hue + 0.12 * lean, 1), {
      maxLuminance,
      x: x(0.82),
      y: 0.06,
    }),
  ];
}

const FAMILY_LOOK = {
  falloff: 1.5,
  oklab: true,
  restore: 0.6,
  saturation: 1,
} satisfies BackdropLook;

function monochrome(seen: readonly Seen[]) {
  const swatches = toneStops(seen).map((stop) =>
    toSwatch({ ...stop, h: rescueHue(stop.h) }, stop),
  );
  return { look: FAMILY_LOOK, swatches } satisfies BackdropDesign;
}

/** Which side the cover's lead color sits on, so covers don't all look alike. */
function leadOnRight(seen: readonly Seen[], lead: Lead) {
  const near = seen.filter((color) => hueDistance(color.h, lead.h) < 0.7);
  const total = near.reduce(
    (sum, color) => sum + color.population * color.c,
    0,
  );
  const x = near.reduce(
    (sum, color) => sum + color.x * color.population * color.c,
    0,
  );
  return total > 0 && x / total > 0.5;
}

function family({ clusters }: ArtworkColors, changes: Partial<Tuning> = {}) {
  const seen = read(clusters);
  const [lead] = familiesOf(seen);
  if (lead === undefined) return monochrome(seen);
  return {
    look: FAMILY_LOOK,
    swatches: familySwatches(lead, seen, !leadOnRight(seen, lead), {
      ...BASE_TUNING,
      ...changes,
    }),
  } satisfies BackdropDesign;
}

/** What release builds show until a winner replaces it. */
export const CURRENT_VARIANT = {
  design: ({ clusters }: ArtworkColors) =>
    ({
      look: ORIGINAL_LOOK,
      swatches: backdropPalette(clusters),
    }) satisfies BackdropDesign,
  id: "current",
  label: "Current",
};

export const VARIANTS = [
  {
    design: (colors: ArtworkColors) => family(colors),
    id: "family",
    label: "Family",
  },
  {
    design: (colors: ArtworkColors) =>
      family(colors, { ceiling: 0.125, chroma: 0.72 }),
    id: "soft",
    label: "Soft",
  },
  {
    design: (colors: ArtworkColors) => family(colors, { matched: true }),
    id: "matched",
    label: "Matched",
  },
  {
    design: (colors: ArtworkColors) => family(colors, { lean: 0.25 }),
    id: "pure",
    label: "Pure",
  },
  {
    design: (colors: ArtworkColors) =>
      family(colors, { lift: -0.07, maxLuminance: 0.065 }),
    id: "deep",
    label: "Deep",
  },
] as const;
