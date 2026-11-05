import "~/global.css";

import { useWindowDimensions } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { useCSSVariable } from "uniwind";

import { installDevAutomation } from "~/features/dev/automation";
import { downloadFeature } from "~/features/download/feature";
import { ExportBanner } from "~/features/export/export-banner";
import { ImportActivity } from "~/features/import/import-activity";
import { wifiSheetDetent } from "~/features/import/transfer-link";
import { installWifiTransfer } from "~/features/import/wifi-transfer";
import { holdSplash } from "~/features/library/launch-splash";
import { LibraryGate } from "~/features/library/library-gate";
import { QueueToast } from "~/features/player/queue-toast";
import { applyStoredPreferences } from "~/features/preferences/store";
import { queryClient } from "~/lib/query-client";

// The splash is a plain background, up until the Library tab has laid out.
holdSplash();
applyStoredPreferences();
installDevAutomation();
installWifiTransfer();
downloadFeature?.installDownloads();

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
 * An edit or create sheet with its own stack (the form, and the lists it
 * pushes such as Edit Songs), as a page sheet: a form sheet can't hold a stack.
 */
const EDIT_SHEET = { presentation: "modal" } as const;

/** The tabs, with the library's sheets over them (docs/ui.md → Editing). */
function RootStack() {
  const { height } = useWindowDimensions();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="new-playlist" options={EDIT_SHEET} />
      <Stack.Screen name="new-album" options={EDIT_SHEET} />
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
      <Stack.Screen
        name="delete-album/[id]"
        options={{
          // Clear, so iOS 26's glass shows through at this partial detent.
          contentStyle: { backgroundColor: "transparent" },
          headerShown: true,
          headerTransparent: true,
          presentation: "formSheet",
          sheetAllowedDetents: "fitToContents",
          sheetGrabberVisible: true,
          title: "Delete Album?",
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
          // Clear, so iOS 26's glass shows through at this partial detent.
          contentStyle: { backgroundColor: "transparent" },
          headerShown: true,
          headerTransparent: true,
          presentation: "formSheet",
          sheetAllowedDetents: [wifiSheetDetent(height)],
          sheetGrabberVisible: true,
          title: "Wi-Fi Transfer",
        }}
      />
      <Stack.Screen name="import/download" options={EDIT_SHEET} />
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
            <QueueToast />
            <ExportBanner />
          </LibraryGate>
        </QueryClientProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
