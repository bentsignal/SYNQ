/**
 * Turns a cover's average colors into the player's backdrop gradient: the
 * art's own hues, dimmed until white text reads well over them (2.5.2 used
 * the colors as they were, which washed out its controls on light art).
 */

/** The brightest a backdrop color may be, as relative luminance (0–1). */
const MAX_LUMINANCE = 0.12;

function channels(hex: string) {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (match?.[1] === undefined) return null;
  const value = Number.parseInt(match[1], 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255] as const;
}

function linear(channel: number) {
  const c = channel / 255;
  return c <= 0.040_45 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** WCAG relative luminance of an sRGB color. */
export function luminance(hex: string) {
  const rgb = channels(hex);
  if (rgb === null) return 0;
  const [r, g, b] = rgb;
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

function toHex(value: number) {
  return Math.round(Math.max(0, Math.min(255, value)))
    .toString(16)
    .padStart(2, "0");
}

/**
 * `hex` scaled toward black until its luminance is at most
 * `MAX_LUMINANCE` (darker colors pass through unchanged).
 */
export function dimmed(hex: string) {
  const rgb = channels(hex);
  if (rgb === null) return null;
  const current = luminance(hex);
  if (current <= MAX_LUMINANCE) return `#${rgb.map(toHex).join("")}`;
  // Luminance is roughly linear in the linearized channels, and scaling
  // linear channels by k scales luminance by k; convert k back to sRGB.
  const k = MAX_LUMINANCE / current;
  const scaled = rgb.map((channel) => {
    const lin = linear(channel) * k;
    const srgb =
      lin <= 0.003_130_8 ? lin * 12.92 : 1.055 * lin ** (1 / 2.4) - 0.055;
    return srgb * 255;
  });
  return `#${scaled.map(toHex).join("")}`;
}

/** The two gradient stops for the player, or null to fall back. */
export function backdropColors(averages: readonly string[]) {
  const [top, bottom] = averages.map(dimmed);
  if (top === null || top === undefined) return null;
  return [top, bottom ?? top] as const;
}
