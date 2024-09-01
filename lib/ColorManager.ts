import tinycolor from 'tinycolor2';

export const darkenColor = (color: string, lightness: number, saturation: number) => {
  const hsl = tinycolor(color).toHsl();
  hsl.l = Math.max(0, hsl.l - lightness / 100);
  hsl.s = Math.max(0, hsl.s - saturation / 100);
  return tinycolor(hsl).toHexString();
};

export const calculateDarkeningAmount = (mainColor: string, disabledColor: string) => {
  const mainLuminance = tinycolor(mainColor).getLuminance();
  const disabledLuminance = tinycolor(disabledColor).getLuminance();
  return (mainLuminance - disabledLuminance) * 100;
};

export const getDisabledColor = (mainColor: string) => {
  return darkenColor(mainColor, 40, 50);
}

export const hexToRGB = (hex: string) => {

  // Remove the leading '#' if present
  hex = hex.replace(/^#/, '');

  // Check if the hex value is valid (either 3 or 6 characters)
  if (hex.length === 3) {
    // Convert 3-character hex to 6-character hex
    hex = hex.split('').map(char => char + char).join('');
  } else if (hex.length !== 6) {
    // Invalid hex format
    return null;
  }

  // Extract the red, green, and blue components
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  return { r, g, b };
  
}
