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
  degrees,
  familiesOf,
  glowLightness,
  maxChroma,
  radians,
  rescueHue,
  shadowHue,
  toSwatch,
  vivid,
} from "./backdrop-families.ts";
import {
  backdropPalette,
  clamp,
  hueDistance,
  read,
  toLch,
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
  grid?: readonly string[];
}

export const ORIGINAL_LOOK = {
  falloff: 1.5,
  oklab: false,
  restore: 0,
  saturation: 1,
} satisfies BackdropLook;

/**
 * One hue family, from a deep ground up to a glow, each step rotated a little
 * the way light does. No second hue, so nothing can clash, and lightness does
 * the work that competing hues did.
 */
function familySwatches(lead: Lead, seen: readonly Seen[], flip: boolean) {
  const dark = darknessOf(seen);
  const hue = rescueHue(lead.h, lead.l);
  // A cover with faint color gets a faint backdrop, not an invented vivid one.
  const share = clamp(lead.c / 0.09, 0.65, 1);
  const top = glowLightness(dark);
  const ground = 0.13 + (1 - dark) * 0.12;
  function x(at: number) {
    return flip ? 1 - at : at;
  }
  return [
    toSwatch(vivid(ground, shadowHue(hue, 0.5), share * 0.85), {
      weight: 1.2,
      x: x(0.92),
      y: 1.02,
    }),
    toSwatch(vivid(ground + 0.07, shadowHue(hue, 0.35), share * 0.85), {
      x: x(0.05),
      y: 0.82,
    }),
    toSwatch(vivid(top - 0.14, shadowHue(hue, 0.15), share * 0.9), {
      x: x(0.9),
      y: 0.5,
    }),
    toSwatch(vivid(top - 0.04, hue, share * 0.9), { x: x(0.04), y: 0.36 }),
    toSwatch(vivid(top, hue + 0.12, share), { x: x(0.82), y: 0.06 }),
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

function family({ clusters }: ArtworkColors) {
  const seen = read(clusters);
  const [lead] = familiesOf(seen);
  if (lead === undefined) return monochrome(seen);
  return {
    look: FAMILY_LOOK,
    swatches: familySwatches(lead, seen, !leadOnRight(seen, lead)),
  } satisfies BackdropDesign;
}

/**
 * The family, lit from above. The text sits in the screen's lower half, so
 * only that half has to stay dark: behind the artwork the color can be bright
 * enough to be gold rather than olive, and it falls away to a deep ground under
 * the controls. The light is what Apple's backdrops have and ours don't.
 */
function glow({ clusters }: ArtworkColors) {
  const seen = read(clusters);
  const [lead] = familiesOf(seen);
  if (lead === undefined) return monochrome(seen);
  const dark = darknessOf(seen);
  const flip = !leadOnRight(seen, lead);
  function x(at: number) {
    return flip ? 1 - at : at;
  }
  // Yellow keeps more of itself in the light.
  const hue = rescueHue(lead.h, lead.l);
  const warm = degrees(hue) > 54 && degrees(hue) < 72;
  const light = warm && degrees(lead.h) > 70 ? radians(84) : hue;
  const share = clamp(lead.c / 0.09, 0.65, 1);
  // A dark cover with little color stays dark: lit up, it's only khaki.
  const top = clamp(0.8 - dark * 0.26 - (1 - share) * 0.2, 0.46, 0.8);
  const ground = 0.11 + (1 - dark) * 0.07;
  const maxLuminance = 0.3;
  return {
    look: { falloff: 2.1, oklab: true, restore: 0.7, saturation: 1 },
    swatches: [
      toSwatch(vivid(top, light, share, 0.17), {
        maxLuminance,
        x: x(0.86),
        y: 0,
      }),
      toSwatch(vivid(top - 0.1, light, share, 0.17), {
        maxLuminance,
        weight: 0.9,
        x: x(0.08),
        y: 0.1,
      }),
      toSwatch(vivid(0.42, hue, share * 0.95), {
        weight: 0.8,
        x: x(0.92),
        y: 0.46,
      }),
      toSwatch(vivid(0.32, shadowHue(hue, 0.2), share * 0.95), {
        weight: 0.8,
        x: x(0.06),
        y: 0.56,
      }),
      toSwatch(vivid(ground + 0.05, shadowHue(hue, 0.4), share * 0.9), {
        x: x(0.85),
        y: 0.8,
      }),
      toSwatch(vivid(ground, shadowHue(hue, 0.55), share * 0.85), {
        weight: 1.2,
        x: x(0.2),
        y: 1.02,
      }),
    ],
  } satisfies BackdropDesign;
}

/**
 * The family, plus one other hue where the cover really has it: darker than
 * the lead (colors of different hue only sit well apart in lightness) and at
 * the far corner, so they meet through the dark, not through grey.
 */
function duo({ clusters }: ArtworkColors) {
  const seen = read(clusters);
  const [lead, ...others] = familiesOf(seen);
  if (lead === undefined) return monochrome(seen);
  const flip = !leadOnRight(seen, lead);
  const base = familySwatches(lead, seen, flip);
  const partner = others.find(
    (other) => other.share >= 0.03 && other.c >= 0.05,
  );
  if (partner === undefined) {
    return { look: FAMILY_LOOK, swatches: base } satisfies BackdropDesign;
  }
  const dark = darknessOf(seen);
  const hue = rescueHue(partner.h, partner.l);
  const x = flip ? 0.08 : 0.92;
  const accent = toSwatch(
    vivid(glowLightness(dark) - 0.14, hue, clamp(partner.c / 0.11, 0.5, 1)),
    { weight: 1.1, x, y: 0.74 },
  );
  return {
    look: { ...FAMILY_LOOK, falloff: 1.9, restore: 0.3 },
    swatches: [...base.filter((_, index) => index !== 2), accent],
  } satisfies BackdropDesign;
}

const GRID_SIDE = 5;

/**
 * The cover itself, graded: Apple's approach (blurred copies of the art,
 * oversaturated), so every color and where it sits comes from the cover. The
 * pools are the blur: a grid of them, mixed softly.
 *
 * `pull` draws hues toward the cover's lead, 0 leaving them alone.
 */
function coverDesign({ clusters, grid }: ArtworkColors, pull: number) {
  const seen = read(clusters);
  if (grid?.length !== GRID_SIDE * GRID_SIDE) return family({ clusters });
  const [lead] = familiesOf(seen);
  if (lead === undefined) return monochrome(seen);
  const dark = darknessOf(seen);
  const swatches = grid.flatMap((hex, index) => {
    const color = toLch(hex);
    if (color === null) return [];
    let { h } = color;
    let boost = 1;
    if (pull > 0) {
      const delta = Math.atan2(Math.sin(h - lead.h), Math.cos(h - lead.h));
      const distance = Math.abs(delta);
      // Near the lead is left alone; further out is drawn in, and fades.
      const near = 0.75;
      if (distance > near) {
        h = lead.h + Math.sign(delta) * (near + (distance - near) * (1 - pull));
        boost = 1 - pull * 0.45 * clamp((distance - near) / 1.2, 0, 1);
      }
    }
    h = rescueHue(h, color.l);
    // Neutral areas (a white shirt, a grey wall) add only grey to a field of
    // color, so they sink into a dark version of the lead.
    const colorful = clamp(color.c / 0.05, 0, 1);
    const hue = colorful < 0.3 ? rescueHue(lead.h, lead.l) : h;
    const chroma = Math.max(color.c, Math.min(lead.c, 0.1) * (1 - colorful));
    const y = (Math.floor(index / GRID_SIDE) + 0.5) / GRID_SIDE;
    // Spread the cover's own light and dark, so the field keeps its shape,
    // and leave the lower half dark enough for the text.
    const light =
      color.l ** 1.25 * (0.72 - dark * 0.2) * (0.5 + colorful * 0.5);
    const l =
      clamp(0.12 + light, 0.12, 0.6) * (1 - 0.4 * clamp((y - 0.4) / 0.6, 0, 1));
    const target = Math.min(
      chroma * 1.7 * boost,
      maxChroma(l, hue) * 0.95,
      0.18,
    );
    return [
      toSwatch(
        { c: target, h: hue, l },
        { x: ((index % GRID_SIDE) + 0.5) / GRID_SIDE, y },
      ),
    ];
  });
  return {
    look: { falloff: 2.8, oklab: true, restore: 0.6, saturation: 1.05 },
    swatches,
  } satisfies BackdropDesign;
}

export const VARIANTS = [
  {
    design: ({ clusters }: ArtworkColors) => ({
      look: ORIGINAL_LOOK,
      swatches: backdropPalette(clusters),
    }),
    id: "current",
    label: "Current",
  },
  { design: family, id: "family", label: "Family" },
  { design: glow, id: "glow", label: "Glow" },
  { design: duo, id: "duo", label: "Duo" },
  {
    design: (colors: ArtworkColors) => coverDesign(colors, 0.45),
    id: "cover",
    label: "Cover",
  },
] as const;
