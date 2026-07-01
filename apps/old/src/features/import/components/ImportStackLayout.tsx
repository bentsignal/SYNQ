import { Colors } from "@/src/constants/Colors";
import Overlay from "@/src/features/app-shell/components/Overlay";
import { useAppShellContext } from "@/src/features/app-shell/context/AppShellProvider";
import ImportControls from "@/src/features/import/components/Controls";
import ImportHeader from "@/src/features/import/components/Header";
import { Stack } from "expo-router";

const ImportStackLayout = () => {
  const { showOverlay } = useAppShellContext();

  return (
    <>
      <ImportHeader />
      <Overlay show={showOverlay} activeOpacity={0.9} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: Colors.background,
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
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
};

export default ImportStackLayout;
