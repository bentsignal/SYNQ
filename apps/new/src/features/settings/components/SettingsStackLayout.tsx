import { Stack } from "expo-router";

export function SettingsStackLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: "#f4f7f5",
        },
        headerShown: false,
      }}
    />
  );
}
