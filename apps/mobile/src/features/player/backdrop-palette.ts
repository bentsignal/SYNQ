/**
 * Chooses the colors behind the player from a cover's clusters
 * (`modules/synq-backdrop`, which weights saturated pixels when clustering):
 * one family of hues, the cover's main one, from a deep ground up to a glow.
 * A single family can't clash, and lightness does the work competing hues would.
 *
 * Every color is capped at `MAX_LUMINANCE`, and the shader only ever blends
 * them, so white text and controls read over the backdrop whatever the cover.
 */
import type { Lch } from "./backdrop-color.ts";
import { maxChroma, toHex, toLch } from "./backdrop-color.ts";

export interface ArtworkCluster {
  color: string;
  /** Its center on the cover, 0–1 from the top left. */
  x: number;
  y: number;
  /** Its share of the cover's pixels, 0–1. */
  population: number;
}

/** A pool of color in the native backdrop. */
export interface BackdropSwatch {
  color: string;
  x: number;
  y: number;
  weight: number;
}

/** Below this chroma (Oklab), a color reads as grey. */
const MIN_CHROMA = 0.03;
/** Clusters smaller than this are noise, not part of the art. */
const MIN_POPULATION = 0.002;
/** Hues this close (radians) count as one family: browns, oranges, skin. */
const FAMILY_WIDTH = 0.7;
/** How much of what the screen can show the colors use. */
const SATURATION = 0.72;
/** The most chroma any color has, short of neon on the hues that go that far. */
const MAX_CHROMA = 0.125;

/**
 * Where the tone-only pools sit, 0–1 over the screen. They cover it evenly and
 * favor what shows around the artwork: its lower half.
 */
const SLOTS = [
  { x: 0.12, y: 0.08 },
  { x: 0.92, y: 0.2 },
  { x: 0.42, y: 0.62 },
  { x: 0.04, y: 0.95 },
  { x: 0.96, y: 0.86 },
] as const;

function clamp(value: number, low: number, high: number) {
  return Math.max(low, Math.min(high, value));
}

function radians(value: number) {
  return (value * Math.PI) / 180;
}

function degrees(hue: number) {
  return ((((hue * 180) / Math.PI) % 360) + 360) % 360;
}

function hueDistance(a: number, b: number) {
  const delta = Math.abs(a - b) % (2 * Math.PI);
  return delta > Math.PI ? 2 * Math.PI - delta : delta;
}

interface Seen extends Lch {
  x: number;
  y: number;
  population: number;
}

function read(clusters: readonly ArtworkCluster[]) {
  return clusters.flatMap((cluster) => {
    const lch = toLch(cluster.color);
    if (lch === null || cluster.population < MIN_POPULATION) return [];
    return [
      {
        ...lch,
        population: cluster.population,
        x: cluster.x,
        y: cluster.y,
      } satisfies Seen,
    ];
  });
}

/** The side of the cover a set of colors sits on, by how much each shows. */
function sitsOnRight(colors: readonly Seen[]) {
  const total = colors.reduce(
    (sum, color) => sum + color.population * color.c,
    0,
  );
  const x = colors.reduce(
    (sum, color) => sum + color.x * color.population * color.c,
    0,
  );
  return total > 0 && x / total > 0.5;
}

interface Lead {
  h: number;
  /** The family's most vivid chroma on the cover. */
  c: number;
  /** How light the family is on the cover. */
  l: number;
}

/**
 * The cover's main color, as a family of hues: nearby hues pool their area, and
 * area counts as much as chroma, so a little text or a logo can't lead. Null
 * for a cover with no color at all.
 */
function leadOf(seen: readonly Seen[]) {
  const colored = seen.filter((color) => color.c >= MIN_CHROMA);
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
  const [first, ...rest] = colored;
  if (first === undefined) return null;
  const best = rest.reduce((a, b) => (score(b) > score(a) ? b : a), first);
  const members = colored.filter(
    (color) => hueDistance(color.h, best.h) < FAMILY_WIDTH,
  );
  const total = members.reduce((sum, color) => sum + weight(color), 0);
  return {
    c: Math.max(...members.map((color) => color.c)),
    h: Math.atan2(
      members.reduce((sum, c) => sum + weight(c) * Math.sin(c.h), 0) / total,
      members.reduce((sum, c) => sum + weight(c) * Math.cos(c.h), 0) / total,
    ),
    l: members.reduce((sum, c) => sum + weight(c) * c.l, 0) / total,
  } satisfies Lead;
}

/**
 * Dark yellow is olive, about the least liked color there is, and white text
 * needs a dark backdrop. Yellows lean into gold and amber as they dim, and the
 * yellow-greens of grass and leaves into green, so nothing lands in between.
 * `sourceLightness` tells them apart: a bright lemon is a yellow, and a dim color
 * at the same hue already reads as green.
 */
function rescueHue(h: number, sourceLightness = 1) {
  const d = degrees(h);
  const split = sourceLightness < 0.6 ? 100 : 118;
  if (d <= 58 || d >= 145) return h;
  if (d <= split) return radians(54 + ((d - 58) / (split - 58)) * 18);
  return radians(132 + ((d - split) / (145 - split)) * 13);
}

/** Shadows lean to violet, the way painters cool a shadow, by the shortest way. */
function shadowHue(h: number, amount: number) {
  const target = radians(290);
  const delta = Math.atan2(Math.sin(target - h), Math.cos(target - h));
  return h + Math.sign(delta) * Math.min(Math.abs(delta), amount);
}

function colorPalette(seen: readonly Seen[], lead: Lead) {
  const dark = seen
    .filter((color) => color.l < 0.3)
    .reduce((sum, color) => sum + color.population, 0);
  const hue = rescueHue(lead.h, lead.l);
  // A cover with faint color gets a faint backdrop, not an invented vivid one.
  const share = SATURATION * clamp(lead.c / 0.09, 0.65, 1);
  const top = clamp(0.56 - dark * 0.15, 0.4, 0.56);
  const ground = 0.13 + (1 - dark) * 0.12;
  // The glow goes on whichever side the cover's color is, so covers differ.
  const flip = !sitsOnRight(
    seen.filter((color) => hueDistance(color.h, lead.h) < FAMILY_WIDTH),
  );
  function swatch(
    { l, h, amount }: { l: number; h: number; amount: number },
    x: number,
    y: number,
    weight = 1,
  ) {
    const c = Math.min(maxChroma(l, h) * share * amount, MAX_CHROMA);
    return {
      color: toHex({ c, h, l }),
      weight,
      x: flip ? 1 - x : x,
      y,
    } satisfies BackdropSwatch;
  }
  return [
    swatch(
      { amount: 0.85, h: shadowHue(hue, 0.5), l: ground },
      0.92,
      1.02,
      1.2,
    ),
    swatch(
      { amount: 0.85, h: shadowHue(hue, 0.35), l: ground + 0.07 },
      0.05,
      0.82,
    ),
    swatch({ amount: 0.9, h: shadowHue(hue, 0.15), l: top - 0.14 }, 0.9, 0.5),
    swatch({ amount: 0.9, h: hue, l: top - 0.04 }, 0.04, 0.36),
    swatch({ amount: 1, h: hue + 0.12, l: top }, 0.82, 0.06),
  ];
}

/**
 * No color to draw on, so the depth comes from tone: a spread of greys
 * centered on how light the cover is, wider when the cover itself has range,
 * with whatever faint tint it has.
 */
function tonePalette(seen: readonly Seen[]) {
  const total = seen.reduce((sum, color) => sum + color.population, 0) || 1;
  const mean =
    seen.reduce((sum, color) => sum + color.l * color.population, 0) / total;
  const lights = seen.map((color) => color.l);
  const range =
    lights.length === 0 ? 0 : Math.max(...lights) - Math.min(...lights);
  const center = 0.25 + mean * 0.14;
  const spread = 0.1 + range * 0.06;
  const tint = seen.reduce((best, color) => (color.c > best.c ? color : best), {
    c: 0,
    h: 0,
  } satisfies Pick<Lch, "c" | "h">);
  const c = Math.min(tint.c, 0.012);
  return SLOTS.map(
    (slot, index) =>
      ({
        ...slot,
        color: toHex({
          c,
          h: rescueHue(tint.h),
          l: clamp(
            center + ([1.25, -0.5, 0.75, -1, 0.25][index] ?? 0) * spread,
            0.13,
            0.5,
          ),
        }),
        weight: 1,
      }) satisfies BackdropSwatch,
  );
}

/** The backdrop for a cover's clusters. */
export function backdropPalette(clusters: readonly ArtworkCluster[]) {
  const seen = read(clusters);
  const lead = leadOf(seen);
  return lead === null ? tonePalette(seen) : colorPalette(seen, lead);
}

/** The backdrop with no cover: the app's charcoal, in slow relief. */
export const CHARCOAL = backdropPalette([]);

/**
 * How far to scale up a cover whose own rounded corners start `cornerInset`
 * of the way along each side, so its art fills a `size` square clipped to
 * `radius` and nothing around the art shows at the corners.
 */
export function cornerZoom(cornerInset: number, size: number, radius: number) {
  if (cornerInset <= 0 || size <= 0) return 1;
  // The clip's corner meets its diagonal this far in.
  const clipInset = (radius * (1 - Math.SQRT1_2)) / size;
  return Math.max(1, (0.5 - clipInset) / (0.5 - cornerInset));
}
