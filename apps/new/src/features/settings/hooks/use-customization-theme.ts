import { useMemo } from "react";
import { useCustomizationSettingsSelector } from "../state/CustomizationSettingsProvider";
import { getCustomizationOption } from "../services/customization-settings-domain-service";

export type CustomizationTheme = {
  accent: string;
  background: string;
  border: string;
  borderSubtle: string;
  danger: string;
  inactive: string;
  mutedText: string;
  onAccent: string;
  primaryText: string;
  secondaryText: string;
  surface: string;
};

export function useCustomizationTheme(): CustomizationTheme {
  const theme = useCustomizationSettingsSelector(
    (store) => store.state.settings.theme,
  );
  const activeTheme = getCustomizationOption(theme);

  return useMemo(
    () => ({
      accent: activeTheme.color,
      background: "#f4f7f5",
      border: "#dbe3de",
      borderSubtle: "#edf2ef",
      danger: "#b42318",
      inactive: "#5f6d66",
      mutedText: "#6f7a75",
      onAccent: "#ffffff",
      primaryText: "#121417",
      secondaryText: "#52605a",
      surface: "#ffffff",
    }),
    [activeTheme.color],
  );
}
