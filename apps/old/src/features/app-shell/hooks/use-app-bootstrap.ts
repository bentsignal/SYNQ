import { useEffect, useState } from "react";
import { PUBLIC_FACEBOOK_APP_ID } from "@/src/constants/Keys";
import { useFont } from "@/src/features/app-shell/hooks/use-font";
import { useHaptics } from "@/src/features/haptics/hooks/use-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useInitDB } from "@synq/db";
import * as SplashScreen from "expo-splash-screen";
import { LogBox } from "react-native";
import { Settings } from "react-native-fbsdk-next";

LogBox.ignoreLogs([
  "Require cycle:",
  "`onLayout` supplied to `React.Fragment`",
]);

SplashScreen.setOptions({
  fade: true,
  duration: 300,
});

SplashScreen.preventAutoHideAsync();

export const useAppBootstrap = () => {
  const [shouldPlayAd, setShouldPlayAd] = useState(false);

  useInitDB();
  const { loadHapticFeedbackPreference } = useHaptics();
  const { fontLoaded } = useFont();

  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hideAsync();
    }, 7000);

    Settings.setAppID(PUBLIC_FACEBOOK_APP_ID);
    Settings.initializeSDK();

    const loadShouldPlayAd = async () => {
      try {
        const playAd = await AsyncStorage.getItem("playAd");
        setShouldPlayAd(playAd === "true" ? true : false);
      } catch {
        setShouldPlayAd(false);
      }
    };

    loadShouldPlayAd();
    loadHapticFeedbackPreference();
  }, [loadHapticFeedbackPreference]);

  useEffect(() => {
    if (fontLoaded) {
      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 500);
    }
  }, [fontLoaded]);

  return { shouldPlayAd };
};
