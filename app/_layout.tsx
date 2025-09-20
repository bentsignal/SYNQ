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
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { LogBox } from "react-native";
import { Settings } from "react-native-fbsdk-next";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../globals.css";
import { db } from "@/src/db";
import migrations from "@/src/db/migrations/migrations";
import { useHapticStore } from "@/src/hooks/use-haptics";
import Model from "@/src/models/Model";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";

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

  const { success, error } = useMigrations(db, migrations);

  const loadHapticFeedbackPreference = useHapticStore(
    (state) => state.loadHapticFeedbackPreference,
  );

  const [fontLoaded] = useFonts({
    JakartaSans: require("@/src/assets/fonts/PlusJakartaSans-VariableFont_wght.ttf"),
  });

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

    const checkDB = async () => {
      try {
        await Model.initConnection();
      } catch (error) {
        console.error("Error creating database:", error);
      }
    };

    loadShouldPlayAd();
    checkDB();
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
