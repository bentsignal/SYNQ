import { Stack } from "expo-router";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

export function AppNavigation() {
  const theme = useCustomizationTheme();

  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: theme.background,
        },
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="settings"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="import"
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="premium"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="player"
        options={{
          fullScreenGestureEnabled: true,
          gestureDirection: "vertical",
          gestureEnabled: true,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="queue"
        options={{
          fullScreenGestureEnabled: true,
          gestureDirection: "vertical",
          gestureEnabled: true,
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
