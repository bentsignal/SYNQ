import { useEffect, useState } from "react";
import Navigation from "@/app/navigation";
import GlobalProgress from "@/src/components/GlobalProgress";
import Sheets from "@/src/components/sheet/Sheets";
import CFG from "@/src/constants/Config";
import {
  PUBLIC_FACEBOOK_APP_ID,
  PUBLIC_POSTHOG_KEY,
} from "@/src/constants/Keys";
import GlobalProvider from "@/src/context/GlobalProvider";
import PlaybackProvider from "@/src/context/PlaybackProvider";
import PremiumProvider from "@/src/context/PremiumProvider";
import PrivacyProvider from "@/src/context/PrivacyProvider";
import ThemeProvider from "@/src/context/ThemeProvider";
import {
  connect,
  restorePurchases,
} from "@/src/controllers/PurchaseController";
import Model from "@/src/models/Model";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from "expo-font";
import { router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { PostHogProvider } from "posthog-react-native";
import { LogBox } from "react-native";
import { Settings } from "react-native-fbsdk-next";
import { GestureHandlerRootView } from "react-native-gesture-handler";

LogBox.ignoreLogs(["Require cycle:"]);

SplashScreen.setOptions({
  fade: true,
  duration: 300,
});

const RootLayout = () => {
  const [shouldPlayAd, setShouldPlayAd] = useState(false);

  const [fontLoaded] = useFonts({
    JakartaSans: require("@/src/assets/fonts/PlusJakartaSans-VariableFont_wght.ttf"),
  });

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();

    Settings.setAppID(PUBLIC_FACEBOOK_APP_ID);
    Settings.initializeSDK();

    // automatically hide splash screen after 7 seconds
    setTimeout(() => {
      SplashScreen.hideAsync();
    }, 7000);

    const loadShouldPlayAd = async () => {
      try {
        const playAd = await AsyncStorage.getItem("playAd");
        setShouldPlayAd(playAd === "true" ? true : false);
      } catch {
        setShouldPlayAd(false);
      }
    };

    const checkDB = async () => {
      try {
        await Model.initConnection();
        await Model.createTables();
      } catch (error) {
        console.error("Error creating database:", error);
      }
    };

    loadShouldPlayAd();
    checkDB();
  }, []);

  // hide splash screen after fonts are loaded
  useEffect(() => {
    if (fontLoaded) {
      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 500);
    }
  }, [fontLoaded]);

  return (
    <ThemeProvider>
      <PremiumProvider>
        <PlaybackProvider>
          <GlobalProvider initShouldPlayAd={shouldPlayAd}>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <GlobalProgress />
              <Sheets />
              <Navigation />
            </GestureHandlerRootView>
          </GlobalProvider>
        </PlaybackProvider>
      </PremiumProvider>
    </ThemeProvider>
  );
};

export default RootLayout;
