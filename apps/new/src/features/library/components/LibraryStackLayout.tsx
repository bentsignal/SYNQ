import { Stack } from "expo-router";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

export function LibraryStackLayout() {
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
