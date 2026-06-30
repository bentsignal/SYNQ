import { Stack } from "expo-router";

import { Colors } from "@/src/constants/Colors";

import ImportControls from "@/src/components/import/Controls";
import ImportHeader from "@/src/components/import/Header";
import Overlay from "@/src/components/Overlay";

import { useAppShellContext } from "@/src/features/app-shell/context/AppShellProvider";

export default function ImportLayout() {
  const { showOverlay } = useAppShellContext();

  return (
    <>
      <ImportHeader />
      <Overlay show={showOverlay} activeOpacity={.9} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: Colors.background,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          },
        }}
      >
        <Stack.Screen
          name="files"
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="wifi"
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="save"
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="export"
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="success"
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="failure"
          options={{
            gestureEnabled: false,
          }}
        />
      </Stack>
      <ImportControls />
    </>
  );
  
}
