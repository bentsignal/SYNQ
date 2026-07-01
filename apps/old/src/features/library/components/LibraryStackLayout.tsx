import { Colors } from "@/src/constants/Colors";
import Top from "@/src/features/app-shell/components/Top";
import Notifications from "@/src/features/notifications/components";
import MiniPlayer from "@/src/features/playback/components/MiniPlayer";
import { Stack } from "expo-router";

const LibraryStackLayout = () => {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: Colors.background,
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: true,
            header: () => <Top />,
          }}
        />
        <Stack.Screen name="album/[id]" />
        <Stack.Screen name="artist/[id]" />
        <Stack.Screen name="playlist/[id]" />
      </Stack>
      <MiniPlayer />
      <Notifications
        customStyles={{
          position: "absolute",
          bottom: 0,
        }}
      />
    </>
  );
};

export default LibraryStackLayout;
