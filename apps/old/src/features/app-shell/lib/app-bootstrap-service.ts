import { PUBLIC_FACEBOOK_APP_ID } from "@/src/constants/Keys";
import { getPlaybackStorageItem } from "@/src/features/playback/lib/playback-storage-service";
import * as SplashScreen from "expo-splash-screen";
import { Settings } from "react-native-fbsdk-next";

export const initializeFacebookSdk = () => {
  Settings.setAppID(PUBLIC_FACEBOOK_APP_ID);
  Settings.initializeSDK();
};

export const hideSplashScreenAfterDelay = (delay: number) => {
  setTimeout(() => {
    void SplashScreen.hideAsync();
  }, delay);
};

export const loadShouldPlayAdPreference = async () => {
  try {
    const playAd = await getPlaybackStorageItem("playAd");
    return playAd === "true";
  } catch {
    return false;
  }
};
