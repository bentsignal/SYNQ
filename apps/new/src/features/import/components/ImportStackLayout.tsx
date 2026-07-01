import { Stack } from "expo-router";
import { ImportSessionProvider } from "../state/import-session-store";

export function ImportStackLayout() {
  return (
    <ImportSessionProvider>
      <Stack
        screenOptions={{
          contentStyle: {
            backgroundColor: "#f4f7f5",
          },
          gestureEnabled: false,
          headerShown: false,
        }}
      />
    </ImportSessionProvider>
  );
}
