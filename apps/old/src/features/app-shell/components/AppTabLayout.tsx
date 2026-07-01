import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import NotificationModal from "@/src/features/notifications/components/NotificationModal";
import Overlay from "@/src/features/app-shell/components/Overlay";
import {
  HomeIcon,
  LibraryIcon,
} from "@/src/features/app-shell/components/TabBarIcons";
import Top from "@/src/features/app-shell/components/Top";
import { useAppShellContext } from "@/src/features/app-shell/context/AppShellProvider";
import Server from "@/src/features/import/components/Server";
import { usePlaybackAdAsset } from "@/src/features/playback/hooks/use-playback-ad-asset";
import { Tabs } from "expo-router";
import { Easing, useWindowDimensions } from "react-native";

const AppTabLayout = () => {
  const { showOverlay } = useAppShellContext();
  const { height } = useWindowDimensions();
  const tabBarBottomPadding = height < 700 ? 15 : 30;

  usePlaybackAdAsset();

  return (
    <>
      <NotificationModal />
      <Overlay show={showOverlay} activeOpacity={0.95} />
      <Server />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.tabActive,
          tabBarInactiveTintColor: Colors.tabInactive,
          tabBarStyle: [
            Styles.tabBar,
            {
              paddingBottom: tabBarBottomPadding,
            },
          ],
          tabBarLabelStyle: Styles.h6,
          tabBarIconStyle: {
            marginBottom: 6,
          },
          sceneStyle: {
            backgroundColor: Colors.background,
          },
          animation: "none",
          transitionSpec: {
            animation: "timing",
            config: {
              duration: 300,
              easing: Easing.out(Easing.ease),
            },
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ focused }) => <HomeIcon focused={focused} />,
            animation: "none",
            headerShown: true,
            header: () => <Top />,
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: "Library",
            tabBarIcon: ({ focused }) => <LibraryIcon focused={focused} />,
            animation: "none",
          }}
        />
      </Tabs>
    </>
  );
};

export default AppTabLayout;
