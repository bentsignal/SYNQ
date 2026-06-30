import { getColors } from "react-native-image-colors";
import { IOSImageColors } from "react-native-image-colors/build/types";
import tinycolor from "tinycolor2";

export const darkenColor = (
  color: string,
  lightness: number,
  saturation: number,
) => {
  const hsl = tinycolor(color).toHsl();
  hsl.l = Math.max(0, hsl.l - lightness / 100);
  hsl.s = Math.max(0, hsl.s - saturation / 100);
  return tinycolor(hsl).toHexString();
};

export const adjustLightness = (color: string, amount: number) => {
  const hsl = tinycolor(color).toHsl();
  hsl.l = Math.max(0, hsl.l - amount / 100);
  return tinycolor(hsl).toHexString();
};

export const calculateDarkeningAmount = (
  mainColor: string,
  disabledColor: string,
) => {
  const mainLuminance = tinycolor(mainColor).getLuminance();
  const disabledLuminance = tinycolor(disabledColor).getLuminance();
  return (mainLuminance - disabledLuminance) * 100;
};

export const getDisabledColor = (mainColor: string) => {
  return darkenColor(mainColor, 30, 20);
};

export const hexToRGB = (hex: string) => {
  const normalizedHex = hex.replace(/^#/, "");

  if (normalizedHex.length === 3) {
    const expandedHex = normalizedHex
      .split("")
      .map((char) => char + char)
      .join("");

    return {
      r: parseInt(expandedHex.slice(0, 2), 16),
      g: parseInt(expandedHex.slice(2, 4), 16),
      b: parseInt(expandedHex.slice(4, 6), 16),
    };
  }

  if (normalizedHex.length !== 6) {
    return null;
  }

  return {
    r: parseInt(normalizedHex.slice(0, 2), 16),
    g: parseInt(normalizedHex.slice(2, 4), 16),
    b: parseInt(normalizedHex.slice(4, 6), 16),
  };
};

const getColorsFromImage = async (uri: string) => {
  const colors = await getColors(uri, {
    fallback: "#000",
    cache: true,
    key: uri,
  });
  return colors as IOSImageColors;
};

export const getLuminance = ({ r, g, b }: { r: number; g: number; b: number }) => {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
};

const isRGB = (
  color: ReturnType<typeof hexToRGB>,
): color is { r: number; g: number; b: number } => {
  return color !== null;
};

export const getLuminanceFromImage = async (uri: string) => {
  const colors = await getColorsFromImage(uri);

  const luminances = [
    hexToRGB(colors.background),
    hexToRGB(colors.primary),
    hexToRGB(colors.secondary),
    hexToRGB(colors.detail),
  ]
    .filter(isRGB)
    .map(getLuminance)
    .filter((luminance) => luminance > 0);

  return luminances.length > 0
    ? luminances.reduce((a, b) => a + b) / luminances.length
    : 0;
};

export const getPlayerGradientOpacity = (luminance: number) => {
  return Math.pow(luminance / 0.7 - 0.7, 2) + 0.4;
};
