import { PUBLIC_FACEBOOK_APP_ID } from "@/src/constants/Keys";
import { playbackStorageKeys } from "@/src/features/playback/lib/playback-storage-keys";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
    const playAd = await AsyncStorage.getItem(playbackStorageKeys.playAd);
    return playAd === "true";
  } catch {
    return false;
  }
};
