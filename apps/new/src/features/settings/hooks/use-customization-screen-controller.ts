import { usePremiumEntitlementSelector } from "@/src/features/premium/state/PremiumEntitlementProvider";
import { useCustomizationSettingsSelector } from "../state/CustomizationSettingsProvider";
import {
  getCustomizationScreenState,
  shouldSendHapticForHapticsToggle,
} from "../services/settings-screen-service";
import type { CustomizationColorKey } from "../types/customization-settings";
import { useHapticFeedback } from "./use-haptic-feedback";

export function useCustomizationScreenController() {
  const premiumActive = usePremiumEntitlementSelector(
    (store) => store.state.active,
  );
  const setAppIcon = useCustomizationSettingsSelector(
    (store) => store.setAppIcon,
  );
  const setHapticsEnabled = useCustomizationSettingsSelector(
    (store) => store.setHapticsEnabled,
  );
  const setTheme = useCustomizationSettingsSelector((store) => store.setTheme);
  const customizationState = useCustomizationSettingsSelector(
    (store) => store.state,
  );
  const { sendHaptic } = useHapticFeedback();
  const screenState = getCustomizationScreenState({
    premiumActive,
    status: customizationState.status,
  });

  const updateTheme = (themeKey: CustomizationColorKey) => {
    sendHaptic("light");
    void setTheme(themeKey);
  };

  const updateAppIcon = (appIcon: CustomizationColorKey) => {
    sendHaptic("light");
    void setAppIcon(appIcon);
  };

  const updateHapticsEnabled = (hapticsEnabled: boolean) => {
    if (
      shouldSendHapticForHapticsToggle({
        hapticsEnabled: customizationState.settings.hapticsEnabled,
      })
    ) {
      sendHaptic("light");
    }

    void setHapticsEnabled(hapticsEnabled);
  };

  return {
    customizationState,
    screenState,
    updateAppIcon,
    updateHapticsEnabled,
    updateTheme,
  };
}

export type CustomizationScreenController = ReturnType<
  typeof useCustomizationScreenController
>;
