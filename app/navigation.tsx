import { Stack } from "expo-router"
import { Colors } from "@/constants/Colors";

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
        }}
      />
      <Stack.Screen 
        name="premium"
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="player"
        options={{
          presentation: "card",
          animation: 'slide_from_bottom',
          animationDuration: 400,
          contentStyle: { backgroundColor: 'transparent' },
          gestureEnabled: true,
          gestureDirection: "vertical",
          fullScreenGestureEnabled: true,
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="queue"
        options={{
          presentation: "card",
          animation: 'fade_from_bottom',
          animationDuration: 300,
          gestureEnabled: false,
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
        }}
      />
      <Stack.Screen
        name="playlist/create"
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
    </Stack>
  );
  
}

export default Navigation;