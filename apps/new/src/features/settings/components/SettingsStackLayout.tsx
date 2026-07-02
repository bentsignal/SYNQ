import { Stack } from "expo-router";
import { useCustomizationTheme } from "../hooks/use-customization-theme";

export function SettingsStackLayout() {
  const theme = useCustomizationTheme();

  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: theme.background,
        },
        headerShown: false,
      }}
    />
  );
}
