import "~/global.css";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { QueryClientProvider } from "@tanstack/react-query";
import { useCSSVariable } from "uniwind";

import { installDevAutomation } from "~/features/dev/automation";
import { ImportActivity } from "~/features/import/import-activity";
import { LibraryGate } from "~/features/library/library-gate";
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

/**
 * A small sheet whose action is a toolbar button (Vera's `TOOLBAR_SHEET`):
 * half height, growing to full, over the tabs.
 */
const TOOLBAR_SHEET = {
  headerShown: true,
  headerTransparent: true,
  presentation: "formSheet" as const,
  sheetAllowedDetents: [0.5, 1],
  sheetGrabberVisible: true,
};

/**
 * An edit sheet with its own stack (the form, and the lists it pushes such
 * as Edit Songs), as a page sheet: a form sheet can't hold a stack.
 */
const EDIT_SHEET = { presentation: "modal" } as const;

/** The tabs, with the library's sheets over them (docs/ui.md → Editing). */
function RootStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="new-playlist"
        options={{ ...TOOLBAR_SHEET, title: "New Playlist" }}
      />
      <Stack.Screen
        name="new-album"
        options={{ ...TOOLBAR_SHEET, title: "New Album" }}
      />
      <Stack.Screen
        name="new-artist"
        options={{ ...TOOLBAR_SHEET, title: "New Artist" }}
      />
      <Stack.Screen
        name="add-to-playlist"
        options={{
          ...TOOLBAR_SHEET,
          sheetAllowedDetents: [0.6, 1],
          title: "Add to Playlist",
        }}
      />
      <Stack.Screen name="edit-playlist/[id]" options={EDIT_SHEET} />
      <Stack.Screen name="edit-album/[id]" options={EDIT_SHEET} />
      <Stack.Screen name="edit-artist/[id]" options={EDIT_SHEET} />
      <Stack.Screen name="edit-song/[id]" options={EDIT_SHEET} />
      <Stack.Screen
        name="player"
        // A sheet over the tabs, closed with a swipe down.
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="queue"
        options={{
          headerShown: true,
          presentation: "formSheet",
          sheetAllowedDetents: [0.5, 1],
          sheetGrabberVisible: true,
          title: "Queue",
        }}
      />
      <Stack.Screen
        name="import/wifi"
        options={{
          headerShown: true,
          headerTransparent: true,
          presentation: "formSheet",
          sheetAllowedDetents: [0.42],
          sheetGrabberVisible: true,
          title: "Wi-Fi Transfer",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={useNavigationTheme()}>
        <QueryClientProvider client={queryClient}>
          <LibraryGate>
            <RootStack />
            <ImportActivity />
          </LibraryGate>
        </QueryClientProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
