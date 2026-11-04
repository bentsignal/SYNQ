/** Oklch and sRGB for the player's backdrop. */

export interface Lch {
  l: number;
  c: number;
  /** Radians. */
  h: number;
}

/**
 * The brightest a backdrop color may be, as relative luminance: white has
 * 7:1 contrast over it, and `muted` text over 3:1.
 */
export const MAX_LUMINANCE = 0.1;

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
function toLinearRgb({ l: lightness, c, h }: Lch) {
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

function inGamut(rgb: readonly number[]) {
  return rgb.every((channel) => channel >= -0.000_1 && channel <= 1.000_1);
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
 * The color as `#rrggbb`, in gamut and under `MAX_LUMINANCE`: chroma gives
 * way first to stay in gamut, keeping the hue, and lightness to stay readable.
 */
export function toHex(color: Lch) {
  let { l, c } = color;
  for (;;) {
    const rgb = toLinearRgb({ c, h: color.h, l });
    if (c > 0 && !inGamut(rgb)) c = Math.max(0, c - 0.004);
    else if (l > 0 && linearLuminance(rgb) > MAX_LUMINANCE) l -= 0.004;
    else break;
  }
  const channels = toLinearRgb({ c, h: color.h, l }).map((channel) =>
    Math.round(gamma(Math.max(0, Math.min(1, channel))) * 255)
      .toString(16)
      .padStart(2, "0"),
  );
  return `#${channels.join("")}`;
}
