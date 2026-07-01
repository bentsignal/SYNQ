import { Stack } from "expo-router";

export function ImportStackLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: "#f4f7f5",
        },
        gestureEnabled: false,
        headerShown: false,
      }}
    />
  );
}
