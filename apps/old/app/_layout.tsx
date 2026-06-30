import { useEffect, useState } from "react";
import Navigation from "@/app/navigation";
import GlobalProgress from "@/src/components/GlobalProgress";
import Sheets from "@/src/components/sheet/Sheets";
import { PUBLIC_FACEBOOK_APP_ID } from "@/src/constants/Keys";
import GlobalProvider from "@/src/context/GlobalProvider";
import PlaybackProvider from "@/src/context/PlaybackProvider";
import PremiumProvider from "@/src/context/PremiumProvider";
import ThemeProvider from "@/src/context/ThemeProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from "expo-splash-screen";
import { LogBox } from "react-native";
import { Settings } from "react-native-fbsdk-next";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../globals.css";
import { useInitDB } from "@synq/db";
import { useFont } from "@/src/hooks/use-font";
import { useHaptics } from "@/src/hooks/use-haptics";
import { GlobalProgressProvider } from "@/src/features/app-shell/context/GlobalProgressProvider";

LogBox.ignoreLogs([
  "Require cycle:",
  "`onLayout` supplied to `React.Fragment`",
]);

SplashScreen.setOptions({
  fade: true,
  duration: 300,
});

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
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
  }, []);

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
            <GlobalProgressProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <GlobalProgress />
                <Sheets />
                <Navigation />
              </GestureHandlerRootView>
            </GlobalProgressProvider>
          </GlobalProvider>
        </PlaybackProvider>
      </PremiumProvider>
    </ThemeProvider>
  );
};

export default RootLayout;
