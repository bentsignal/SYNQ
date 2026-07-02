import { Stack } from "expo-router";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { ImportSessionProvider } from "../state/import-session-store";

export function ImportStackLayout() {
  const theme = useCustomizationTheme();

  return (
    <ImportSessionProvider>
      <Stack
        screenOptions={{
          contentStyle: {
            backgroundColor: theme.background,
          },
          gestureEnabled: false,
          headerShown: false,
        }}
      />
    </ImportSessionProvider>
  );
}
