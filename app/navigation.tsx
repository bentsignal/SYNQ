import { Stack } from "expo-router"
import { Colors } from "@/src/constants/Colors";

const Navigation = () => {
  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: Colors.background,
        },
      }}
    >
      <Stack.Screen 
        name="(tabs)" 
        options={{ 
          headerShown: false,
          animation: 'fade',
          animationDuration: 300,
          gestureEnabled: false,
        }} 
      />
      <Stack.Screen 
        name="tracking"
        options={{
          headerShown: false,
          animation: 'fade',
        }}
      />
      <Stack.Screen 
        name="settings"
        options={{
          headerShown: false,
          presentation: 'modal',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
      <Stack.Screen 
        name="premium"
        options={{
          presentation: "modal",
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
      <Stack.Screen 
        name="player"
        options={{
          presentation: "modal",
          contentStyle: { backgroundColor: 'transparent' },
          gestureEnabled: true,
          gestureDirection: "vertical",
          fullScreenGestureEnabled: true,
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="player/edit"
        options={{
          presentation: "modal",
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: "vertical",
          fullScreenGestureEnabled: true,
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
      <Stack.Screen 
        name="queue"
        options={{
          presentation: "modal",
          // animation: 'fade_from_bottom',
          animationDuration: 300,
          gestureEnabled: true,
          gestureDirection: 'vertical',
          fullScreenGestureEnabled: true,
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
      <Stack.Screen
        name="playlist/[id]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="playlist/add"
        options={{
          headerShown: false,
          presentation: 'modal',
          contentStyle: { backgroundColor: 'transparent'}
        }}
      />
      <Stack.Screen
        name="playlist/create"
        options={{
          headerShown: false,
          presentation: 'modal',
          contentStyle: { backgroundColor: 'transparent'},
        }}
      />
      <Stack.Screen
        name="playlist/edit/[id]"
        options={{
          headerShown: false,
          presentation: 'modal',
          contentStyle: { backgroundColor: 'transparent'},
        }}
      />
      <Stack.Screen
        name="song/edit/[id]"
        options={{
          headerShown: false,
          presentation: 'modal',
          contentStyle: { backgroundColor: 'transparent'},
        }}
      />
      <Stack.Screen
        name="artist/[id]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="artist/create"
        options={{
          headerShown: false,
          presentation: 'modal',
          contentStyle: { backgroundColor: 'transparent'},
        }}
      />
      <Stack.Screen
        name="artist/add"
        options={{
          headerShown: false,
          presentation: 'modal',
          contentStyle: { backgroundColor: 'transparent'},
        }}
      />
      <Stack.Screen
        name="artist/edit/[id]"
        options={{
          headerShown: false,
          presentation: 'modal',
          contentStyle: { backgroundColor: 'transparent'},
        }}
      />
      <Stack.Screen
        name="album/create"
        options={{
          headerShown: false,
          presentation: 'modal',
          contentStyle: { backgroundColor: 'transparent'},
        }}
      />
      <Stack.Screen
        name="album/[id]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="album/add"
        options={{
          headerShown: false,
          presentation: 'modal',
          contentStyle: { backgroundColor: 'transparent'},
        }}
      />
      <Stack.Screen
        name="album/edit/[id]"
        options={{
          headerShown: false,
          presentation: 'modal',
          contentStyle: { backgroundColor: 'transparent'},
        }}
      />
    </Stack>
  );
  
}

export default Navigation;