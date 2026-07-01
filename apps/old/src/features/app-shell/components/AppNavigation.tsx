import { Colors } from "@/src/constants/Colors";
import { Stack } from "expo-router";

const AppNavigation = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: "transparent",
        },
      }}
    >
      <Stack.Screen
        name="(tabs)"
        options={{
          animation: "fade",
          animationDuration: 300,
          gestureEnabled: false,
          contentStyle: {
            backgroundColor: Colors.background,
          },
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          presentation: "modal",
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
          presentation: "modal",
          gestureEnabled: true,
          gestureDirection: "vertical",
          fullScreenGestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="player/edit"
        options={{
          presentation: "modal",
          gestureEnabled: true,
          gestureDirection: "vertical",
          fullScreenGestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="queue"
        options={{
          presentation: "modal",
          animationDuration: 300,
          gestureEnabled: true,
          gestureDirection: "vertical",
          fullScreenGestureEnabled: true,
        }}
      />
      <Stack.Screen name="playlist/[id]" />
      <Stack.Screen name="album/[id]" />
      <Stack.Screen name="artist/[id]" />
      <Stack.Screen
        name="playlist/add"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="playlist/create"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="playlist/edit/[id]"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="song/edit/[id]"
        options={{
          presentation: "modal",
        }}
      />

      <Stack.Screen
        name="artist/create"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="artist/add"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="artist/edit/[id]"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="album/create"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="album/add"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="album/edit/[id]"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="album/reorder"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="import"
        options={{
          gestureEnabled: false,
          contentStyle: {
            backgroundColor: Colors.background,
          },
        }}
      />
    </Stack>
  );
};

export default AppNavigation;
