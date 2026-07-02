import { usePremiumEntitlement } from "@/src/features/premium/context/PremiumEntitlementProvider";
import { useCustomizationSettingsContext } from "../context/CustomizationSettingsProvider";
import {
  getCustomizationScreenState,
  shouldSendHapticForHapticsToggle,
} from "../services/settings-screen-service";
import type { CustomizationColorKey } from "../types/customization-settings";
import { useHapticFeedback } from "./use-haptic-feedback";

export function useCustomizationScreenController() {
  const { state: premiumState } = usePremiumEntitlement();
  const {
    setAppIcon,
    setHapticsEnabled,
    setTheme,
    state: customizationState,
  } = useCustomizationSettingsContext();
  const { sendHaptic } = useHapticFeedback();
  const screenState = getCustomizationScreenState({
    premiumActive: premiumState.active,
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
