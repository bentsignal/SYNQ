import { useEffect, useState } from "react";
import { useFont } from "@/src/features/app-shell/hooks/use-font";
import {
  hideSplashScreenAfterDelay,
  initializeFacebookSdk,
  loadShouldPlayAdPreference,
} from "@/src/features/app-shell/lib/app-bootstrap-service";
import { useHaptics } from "@/src/features/haptics/hooks/use-haptics";
import { useInitDB } from "@synq/db";
import * as SplashScreen from "expo-splash-screen";
import { LogBox } from "react-native";

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
    hideSplashScreenAfterDelay(7000);
    initializeFacebookSdk();
    void loadShouldPlayAdPreference().then(setShouldPlayAd);
    loadHapticFeedbackPreference();
  }, [loadHapticFeedbackPreference]);

  useEffect(() => {
    if (fontLoaded) {
      hideSplashScreenAfterDelay(500);
    }
  }, [fontLoaded]);

  return { shouldPlayAd };
};
