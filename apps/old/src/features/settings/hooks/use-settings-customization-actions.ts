import { useCallback } from "react";
import { captureSettingsPremiumPress } from "@/src/features/settings/lib/settings-analytics";
import { router } from "expo-router";

export const useSettingsCustomizationActions = (premium: boolean) => {
  const openPremium = useCallback(() => {
    captureSettingsPremiumPress(premium);
    router.push("/premium");
  }, [premium]);

  return { openPremium };
};
