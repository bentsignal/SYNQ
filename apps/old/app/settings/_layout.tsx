import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import { Stack } from "expo-router";

const SettingsLayout = () => {
  const { theme } = useThemeContext();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "transparent" },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "Settings",
          contentStyle: { backgroundColor: "transparent" },
        }}
      />
      <Stack.Screen
        name="backup"
        options={{
          headerShown: false,
          contentStyle: { backgroundColor: "transparent" },
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="customization"
        options={{
          headerShown: false,
          contentStyle: { backgroundColor: "transparent" },
          presentation: "modal",
        }}
      />
    </Stack>
  );
};

export default SettingsLayout;
