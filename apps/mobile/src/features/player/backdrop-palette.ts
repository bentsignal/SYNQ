/**
 * Chooses the colors behind the player from a cover's clusters
 * (`modules/synq-backdrop`, which weights saturated pixels when clustering).
 * What counts is what the art feels like, not its average: a black cover
 * with a red ring is a red cover, and a cover with no color at all gets depth
 * from its own tones.
 *
 * Every color is capped at `MAX_LUMINANCE`, and the shader only ever blends
 * them, so white text and controls read over the backdrop whatever the cover.
 */

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

/**
 * The brightest a backdrop color may be, as relative luminance: white has
 * 7:1 contrast over it, and `muted` text over 3:1.
 */
export const MAX_LUMINANCE = 0.1;

/** Below this chroma (Oklab), a color reads as grey. */
export const MIN_CHROMA = 0.03;
/** Clusters smaller than this are noise, not part of the art. */
const MIN_POPULATION = 0.002;
const MAX_ACCENTS = 4;

/**
 * Where the pools sit, 0–1 over the screen. They cover it evenly and favor
 * what shows around the artwork: its lower half.
 */
const SLOTS = [
  { x: 0.12, y: 0.08 },
  { x: 0.92, y: 0.2 },
  { x: 0.42, y: 0.62 },
  { x: 0.04, y: 0.95 },
  { x: 0.96, y: 0.86 },
] as const;

export interface Lch {
  l: number;
  c: number;
  /** Radians. */
  h: number;
}

function linear(channel: number) {
  return channel <= 0.040_45
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;
}

function gamma(channel: number) {
  return channel <= 0.003_130_8
    ? channel * 12.92
    : 1.055 * channel ** (1 / 2.4) - 0.055;
}

/** The color's linear sRGB channels. */
function parseHex(hex: string) {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (match?.[1] === undefined) return null;
  const value = Number.parseInt(match[1], 16);
  return [
    linear(((value >> 16) & 255) / 255),
    linear(((value >> 8) & 255) / 255),
    linear((value & 255) / 255),
  ] as const;
}

export function toLch(hex: string) {
  const srgb = parseHex(hex);
  if (srgb === null) return null;
  const [r, g, b] = srgb;
  const l = Math.cbrt(0.412_221_47 * r + 0.536_332_54 * g + 0.051_445_99 * b);
  const m = Math.cbrt(0.211_903_5 * r + 0.680_699_55 * g + 0.107_396_96 * b);
  const s = Math.cbrt(0.088_302_46 * r + 0.281_718_84 * g + 0.629_978_7 * b);
  const a = 1.977_998_5 * l - 2.428_592_21 * m + 0.450_593_71 * s;
  const lab = 0.025_904_04 * l + 0.782_771_77 * m - 0.808_675_77 * s;
  return {
    c: Math.hypot(a, lab),
    h: Math.atan2(lab, a),
    l: 0.210_454_26 * l + 0.793_617_79 * m - 0.004_072_05 * s,
  } satisfies Lch;
}

/** Linear sRGB; components outside 0–1 are out of gamut. */
export function toLinearRgb({ l: lightness, c, h }: Lch) {
  const a = c * Math.cos(h);
  const b = c * Math.sin(h);
  const l = (lightness + 0.396_337_78 * a + 0.215_803_76 * b) ** 3;
  const m = (lightness - 0.105_561_35 * a - 0.063_854_17 * b) ** 3;
  const s = (lightness - 0.089_484_18 * a - 1.291_485_55 * b) ** 3;
  return [
    4.076_741_66 * l - 3.307_711_59 * m + 0.230_969_93 * s,
    -1.268_438 * l + 2.609_757_4 * m - 0.341_319_4 * s,
    -0.004_196_09 * l - 0.703_418_61 * m + 1.707_614_7 * s,
  ] as const;
}

function linearLuminance([r, g, b]: readonly [number, number, number]) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG relative luminance of an sRGB color. */
export function luminanceOf(hex: string) {
  const srgb = parseHex(hex);
  return srgb === null ? 0 : linearLuminance(srgb);
}

export function inGamut(rgb: readonly number[]) {
  return rgb.every((channel) => channel >= -0.000_1 && channel <= 1.000_1);
}

/**
 * The color as `#rrggbb`, in gamut and under `MAX_LUMINANCE`: chroma gives
 * way first to stay in gamut, keeping the hue, and lightness to stay readable.
 */
export function toHex(color: Lch, maxLuminance = MAX_LUMINANCE) {
  let { l, c } = color;
  for (;;) {
    const rgb = toLinearRgb({ c, h: color.h, l });
    if (c > 0 && !inGamut(rgb)) c = Math.max(0, c - 0.004);
    else if (l > 0 && linearLuminance(rgb) > maxLuminance) l -= 0.004;
    else break;
  }
  const channels = toLinearRgb({ c, h: color.h, l }).map((channel) =>
    Math.round(gamma(Math.max(0, Math.min(1, channel))) * 255)
      .toString(16)
      .padStart(2, "0"),
  );
  return `#${channels.join("")}`;
}

export function clamp(value: number, low: number, high: number) {
  return Math.max(low, Math.min(high, value));
}

export function hueDistance(a: number, b: number) {
  const delta = Math.abs(a - b) % (2 * Math.PI);
  return delta > Math.PI ? 2 * Math.PI - delta : delta;
}

export interface Seen extends Lch {
  x: number;
  y: number;
  population: number;
}

export function read(clusters: readonly ArtworkCluster[]) {
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

/**
 * The colors worth showing, most striking first: chroma counts more than
 * area, so a small red ring beats a large muddy brown, and hues too close to
 * one already chosen add nothing.
 */
function accentsOf(seen: readonly Seen[]) {
  // `filter` made a new array, so sorting it in place is safe (Hermes has no
  // `toSorted`).
  const ranked = seen
    .filter((color) => color.c >= MIN_CHROMA)
    .sort((a, b) => b.c * b.population ** 0.35 - a.c * a.population ** 0.35);
  const accents = new Array<Seen>();
  for (const color of ranked) {
    const distinct = accents.every(
      (accent) =>
        hueDistance(accent.h, color.h) > 0.4 ||
        Math.abs(accent.l - color.l) > 0.2,
    );
    if (distinct && accents.length < MAX_ACCENTS) accents.push(color);
  }
  return accents;
}

export interface Stop extends Lch {
  /** Where on the cover it comes from, to choose a slot. */
  x: number;
  y: number;
  weight: number;
}

/** Bright enough to glow and dark enough for white text; vivid, not neon. */
function glow(color: Seen, weight = 1) {
  return {
    ...color,
    c: clamp(color.c * 1.25, 0.05, 0.135),
    l: clamp(color.l, 0.42, 0.56),
    weight,
  } satisfies Stop;
}

/** Olive isn't anyone's favorite: dim yellows lean toward amber, not green. */
function neighborHue(hue: number, shift: number) {
  const degrees = ((hue * 180) / Math.PI + 360) % 360;
  return degrees > 75 && degrees < 135 ? hue - Math.abs(shift) : hue + shift;
}

function colorStops(accents: readonly Seen[], seen: readonly Seen[]) {
  const stops = accents.map((accent) => glow(accent));
  const [lead] = stops;
  if (lead === undefined) return [];
  // A single color would be flat; its neighbors in hue and shade give it depth.
  if (stops.length === 1) {
    stops.push({
      ...lead,
      h: neighborHue(lead.h, 0.32),
      l: lead.l - 0.1,
      x: 1 - lead.x,
      y: 1 - lead.y,
    });
  }
  if (stops.length === 2) {
    stops.push({
      ...lead,
      c: lead.c * 0.8,
      h: neighborHue(lead.h, -0.26),
      l: lead.l - 0.16,
      x: lead.y,
      y: lead.x,
    });
  }
  // The ground the colors float in, at the bottom corners, in the lead's hue:
  // as dark as the cover is dark, so a black cover stays black in spirit and a
  // flat color fills the screen.
  const dark = seen
    .filter((color) => color.l < 0.3)
    .reduce((sum, color) => sum + color.population, 0);
  const grounds = new Array<Stop>();
  while (stops.length + grounds.length < SLOTS.length) {
    const depth = grounds.length === 0 ? 0.18 : 0.25;
    grounds.push({
      c: Math.min(lead.c * (0.45 + (1 - dark) * 0.3), 0.08),
      h: lead.h,
      l: depth * dark + (lead.l - 0.2 + grounds.length * 0.04) * (1 - dark),
      weight: 1.1,
      x: grounds.length % 2 === 0 ? 0 : 1,
      y: 1,
    });
  }
  // The ground takes its corners first; the colors share what's left.
  return [...grounds, ...stops];
}

/**
 * No color to draw on, so the depth comes from tone: a spread of greys
 * centered on how light the cover is, wider when the cover itself has range,
 * with whatever faint tint it has.
 */
export function toneStops(seen: readonly Seen[]) {
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
  return [1.25, -0.5, 0.75, -1, 0.25].map(
    (offset, index) =>
      ({
        c,
        h: tint.h,
        l: clamp(center + offset * spread, 0.13, 0.5),
        weight: 1,
        x: SLOTS[index]?.x ?? 0.5,
        y: SLOTS[index]?.y ?? 0.5,
      }) satisfies Stop,
  );
}

/** Gives each stop, in order, the free slot nearest where it sits on the cover. */
export function placed(stops: readonly Stop[]) {
  const free = [...SLOTS];
  return stops.flatMap((stop) => {
    const nearest = free.reduce(
      (best, slot, index) =>
        Math.hypot(slot.x - stop.x, slot.y - stop.y) <
        Math.hypot((free[best]?.x ?? 0) - stop.x, (free[best]?.y ?? 0) - stop.y)
          ? index
          : best,
      0,
    );
    const [slot] = free.splice(nearest, 1);
    if (slot === undefined) return [];
    return [
      {
        ...slot,
        color: toHex(stop),
        weight: stop.weight,
      } satisfies BackdropSwatch,
    ];
  });
}

/** The backdrop for a cover's clusters. */
export function backdropPalette(clusters: readonly ArtworkCluster[]) {
  const seen = read(clusters);
  const accents = accentsOf(seen);
  return placed(
    accents.length === 0 ? toneStops(seen) : colorStops(accents, seen),
  );
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
