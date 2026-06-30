import { useEffect, useRef, useState } from "react";
import Server from "@/src/components/import/Server";
import NotificationModal from "@/src/components/modals/NotificationModal";
import Overlay from "@/src/components/Overlay";
import { HomeIcon, LibraryIcon } from "@/src/components/TabBarIcons";
import Top from "@/src/components/Top";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { useGlobalContext } from "@/src/context/GlobalProvider";
import { useAppShellContext } from "@/src/features/app-shell/context/AppShellProvider";
import { useAssets } from "expo-asset";
import { Tabs } from "expo-router";
import { Easing, View } from "react-native";

const TabLayout = () => {
  const { setAdURL } = useGlobalContext();
  const { showOverlay } = useAppShellContext();

  const [assets, error] = useAssets([require("@/src/assets/audio/ad.mp3")]);

  useEffect(() => {
    if (error) {
      return;
    }
    if (assets) {
      setAdURL(assets[0].uri);
    }
  }, [assets]);

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
          tabBarStyle: Styles.tabBar,
          tabBarLabelStyle: Styles.h6,
          tabBarIconStyle: {
            marginBottom: 6,
          },
          sceneStyle: {
            backgroundColor: Colors.background,
          },
          // animation: 'shift',
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
            tabBarIcon: ({ color, focused }) => <HomeIcon focused={focused} />,
            animation: "none",
            headerShown: true,
            header: () => <Top />,
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: "Library",
            tabBarIcon: ({ color, focused }) => (
              <LibraryIcon focused={focused} />
            ),
            animation: "none",
          }}
        />
      </Tabs>
    </>
  );
};

export default TabLayout;
