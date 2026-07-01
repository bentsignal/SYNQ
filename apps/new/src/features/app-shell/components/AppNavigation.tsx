import { Stack } from "expo-router";

export function AppNavigation() {
  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: "#f4f7f5",
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
