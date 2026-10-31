import "~/global.css";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { QueryClientProvider } from "@tanstack/react-query";
import { useCSSVariable } from "uniwind";

import { installDevAutomation } from "~/features/dev/automation";
import { applyStoredPreferences } from "~/features/preferences/store";
import { queryClient } from "~/lib/query-client";

// The splash is a plain background, so the app fades in over it.
SplashScreen.setOptions({ duration: 250, fade: true });
applyStoredPreferences();
installDevAutomation();

function color<Fallback>(
  value: string | number | undefined,
  fallback: Fallback,
) {
  return typeof value === "string" ? value : fallback;
}

/** React Navigation's colors from the theme tokens in global.css. */
function useNavigationTheme() {
  const [accent, background, separator] = useCSSVariable([
    "--color-accent",
    "--color-background",
    "--color-separator",
  ]);
  return {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: color(background, DarkTheme.colors.background),
      border: color(separator, DarkTheme.colors.border),
      card: color(background, DarkTheme.colors.card),
      primary: color(accent, DarkTheme.colors.primary),
    },
  };
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={useNavigationTheme()}>
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
          </Stack>
        </QueryClientProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
