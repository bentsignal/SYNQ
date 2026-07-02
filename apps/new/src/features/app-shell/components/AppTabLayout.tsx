import { Tabs } from "expo-router";
import { View } from "react-native";
import { PlaybackMiniPlayer } from "@/src/features/playback/components/PlaybackMiniPlayer";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

export function AppTabLayout() {
  const theme = useCustomizationTheme();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          sceneStyle: {
            backgroundColor: theme.background,
          },
          tabBarActiveTintColor: theme.accent,
          tabBarInactiveTintColor: theme.inactive,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "700",
            letterSpacing: 0,
          },
          tabBarStyle: {
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
            minHeight: 74,
            paddingBottom: 18,
            paddingTop: 10,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: "Library",
          }}
        />
        <Tabs.Screen
          name="import"
          options={{
            title: "Import",
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
          }}
        />
      </Tabs>
      <PlaybackMiniPlayer />
    </View>
  );
}
