import { useCallback } from "react";
import {
  captureSettingsPremiumPress,
  captureSocialPress,
} from "@/src/features/settings/lib/settings-analytics";
import { router } from "expo-router";
import * as StoreReview from "expo-store-review";
import { Linking } from "react-native";

export const useSettingsScreenActions = (premium: boolean) => {
  const openPremium = useCallback(() => {
    captureSettingsPremiumPress(premium);
    router.push("/premium");
  }, [premium]);

  const openCustomization = useCallback(() => {
    router.push("/settings/customization");
  }, []);

  const openBackup = useCallback(() => {
    router.push("/settings/backup");
  }, []);

  const requestReview = useCallback(async () => {
    const available = await StoreReview.isAvailableAsync();
    if (available) {
      await StoreReview.requestReview();
    }
  }, []);

  const openSupport = useCallback(() => {
    void Linking.openURL("https://directedbyshawn.com/synq-support");
  }, []);

  const openSocial = useCallback((url: string) => {
    captureSocialPress(url);
    void Linking.openURL(url);
  }, []);

  return {
    openBackup,
    openCustomization,
    openPremium,
    openSocial,
    openSupport,
    requestReview,
  };
};
