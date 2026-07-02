import { Tabs } from "expo-router";
import { useCustomizationSettingsContext } from "@/src/features/settings/context/CustomizationSettingsProvider";
import { getCustomizationOption } from "@/src/features/settings/services/customization-settings-service";

export function AppTabLayout() {
  const { state } = useCustomizationSettingsContext();
  const activeTheme = getCustomizationOption(state.settings.theme);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: "#f4f7f5",
        },
        tabBarActiveTintColor: activeTheme.color,
        tabBarInactiveTintColor: "#5f6d66",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
          letterSpacing: 0,
        },
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#dbe3de",
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
    </Tabs>
  );
}
