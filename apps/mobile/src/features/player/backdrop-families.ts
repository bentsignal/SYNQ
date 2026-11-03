/**
 * What the backdrop experiments agree on (`backdrop-variants.ts`): which colors
 * lead a cover, and how to show a hue without it going olive or dull.
 */
import type { BackdropSwatch, Lch, Seen } from "./backdrop-palette.ts";
import {
  clamp,
  hueDistance,
  inGamut,
  MAX_LUMINANCE,
  MIN_CHROMA,
  toHex,
  toLinearRgb,
} from "./backdrop-palette.ts";

export function radians(value: number) {
  return (value * Math.PI) / 180;
}

export function degrees(hue: number) {
  return ((((hue * 180) / Math.PI) % 360) + 360) % 360;
}

/** The most chroma this lightness and hue can have on screen. */
export function maxChroma(l: number, h: number) {
  let low = 0;
  let high = 0.4;
  for (let step = 0; step < 12; step++) {
    const c = (low + high) / 2;
    if (inGamut(toLinearRgb({ c, h, l }))) low = c;
    else high = c;
  }
  return low;
}

/**
 * Dark yellow is olive, about the least liked color there is, and white text
 * needs a dark backdrop. Yellows lean into gold and amber as they dim, and the
 * yellow-greens of grass and leaves into green, so nothing lands in between.
 * `sourceLightness` tells them apart: a bright lemon is a yellow, and a dim color
 * at the same hue already reads as green.
 */
export function rescueHue(h: number, sourceLightness = 1) {
  const d = degrees(h);
  const split = sourceLightness < 0.6 ? 100 : 118;
  if (d <= 58 || d >= 145) return h;
  if (d <= split) return radians(54 + ((d - 58) / (split - 58)) * 18);
  return radians(132 + ((d - split) / (145 - split)) * 13);
}

/** A color at a share of the most vivid it can be, with a ceiling short of neon. */
export function vivid(l: number, h: number, share: number, ceiling = 0.16) {
  return { c: Math.min(maxChroma(l, h) * share, ceiling), h, l } satisfies Lch;
}

/** Shadows lean to violet, the way painters cool a shadow, by the shortest way. */
export function shadowHue(h: number, amount: number) {
  const target = radians(290);
  const delta = Math.atan2(Math.sin(target - h), Math.cos(target - h));
  return h + Math.sign(delta) * Math.min(Math.abs(delta), amount);
}

export interface Lead {
  h: number;
  /** How vivid the family is on the cover, 0.16 being very. */
  c: number;
  /** How light the family is on the cover. */
  l: number;
  /** The cover's area in this family of hues. */
  share: number;
}

/**
 * The cover's main colors as hue families: nearby hues pool their area, so
 * browns, oranges, and skin tones count as one thing. Area counts as much as
 * chroma, so a little text or a logo can't lead.
 */
export function familiesOf(seen: readonly Seen[]) {
  const colored = seen.filter((color) => color.c >= MIN_CHROMA);
  const families = new Array<Lead & { score: number }>();
  const remaining = [...colored];
  function score(center: Seen) {
    return colored.reduce(
      (sum, color) =>
        sum +
        color.population *
          Math.min(color.c, 0.14) *
          Math.exp(-((hueDistance(color.h, center.h) / 0.5) ** 2)),
      0,
    );
  }
  function weight(color: Seen) {
    return color.population * color.c;
  }
  while (remaining.length > 0) {
    const best = remaining.reduce((a, b) => (score(b) > score(a) ? b : a));
    const members = remaining.filter(
      (color) => hueDistance(color.h, best.h) < 0.7,
    );
    const total = members.reduce((sum, color) => sum + weight(color), 0);
    const x = members.reduce(
      (sum, color) => sum + weight(color) * Math.cos(color.h),
      0,
    );
    const y = members.reduce(
      (sum, color) => sum + weight(color) * Math.sin(color.h),
      0,
    );
    families.push({
      c: Math.max(...members.map((color) => color.c)),
      h: Math.atan2(y / total, x / total),
      l:
        members.reduce((sum, color) => sum + weight(color) * color.l, 0) /
        total,
      score: score(best),
      share: members.reduce((sum, color) => sum + color.population, 0),
    });
    for (const member of members)
      remaining.splice(remaining.indexOf(member), 1);
  }
  return families;
}

export interface SwatchPlace {
  x: number;
  y: number;
  weight?: number;
  maxLuminance?: number;
}

/** How dark the cover is, 0–1, by area. */
export function darknessOf(seen: readonly Seen[]) {
  return seen
    .filter((color) => color.l < 0.3)
    .reduce((sum, color) => sum + color.population, 0);
}

/** The family's lightest color, a share of the cover's darkness below it. */
export function glowLightness(dark: number) {
  return clamp(0.56 - dark * 0.15, 0.4, 0.56);
}

export function toSwatch(
  color: Lch,
  { x, y, weight = 1, maxLuminance = MAX_LUMINANCE }: SwatchPlace,
) {
  return {
    color: toHex(color, maxLuminance),
    weight,
    x,
    y,
  } satisfies BackdropSwatch;
}
