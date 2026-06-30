import { Colors } from '@/src/constants/Colors';
import { getColors } from 'react-native-image-colors';
import { IOSImageColors } from 'react-native-image-colors/build/types';
import tinycolor from 'tinycolor2';

export const darkenColor = (color: string, lightness: number, saturation: number) => {
  const hsl = tinycolor(color).toHsl();
  hsl.l = Math.max(0, hsl.l - lightness / 100);
  hsl.s = Math.max(0, hsl.s - saturation / 100);
  return tinycolor(hsl).toHexString();
};

export const adjustLightness = (color: string, amount: number) => {
  const hsl = tinycolor(color).toHsl();
  hsl.l = Math.max(0, hsl.l - amount / 100);
  return tinycolor(hsl).toHexString();
}

export const calculateDarkeningAmount = (mainColor: string, disabledColor: string) => {
  const mainLuminance = tinycolor(mainColor).getLuminance();
  const disabledLuminance = tinycolor(disabledColor).getLuminance();
  return (mainLuminance - disabledLuminance) * 100;
};

export const getDisabledColor = (mainColor: string) => {
  return darkenColor(mainColor, 30, 20);
}

export const hexToRGB = (hex: string) => {

  hex = hex.replace(/^#/, '');

  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  } else if (hex.length !== 6) {
    return null;
  }

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  return { r, g, b };
  
}

const getColorsFromImage = async (uri: string) => {
  const colors = await getColors(uri, {
    fallback: '#000',
    cache: true,
    key: uri,
  });
  return colors as IOSImageColors;
}

export const getLuminance = ({r, g, b}: {r: number, g: number, b: number}) => {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

export const getLuminanceFromImage = async (uri: string) => {

  const colors = await getColorsFromImage(uri);

  const luminances = [
    getLuminance(hexToRGB(colors.background)),
    getLuminance(hexToRGB(colors.primary)), 
    getLuminance(hexToRGB(colors.secondary)),
    getLuminance(hexToRGB(colors.detail))
  ].filter(l => l > 0);

  const averageLuminance = luminances.length > 0 ? 
    luminances.reduce((a, b) => a + b) / luminances.length : 
    0;

  return averageLuminance;
}

export const getPlayerGradientOpacity = (luminance: number) => {
  return Math.pow(luminance / 0.7 - 0.7, 2) + 0.4;
}