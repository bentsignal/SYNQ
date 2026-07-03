import { usePremiumEntitlementSelector } from "@/src/features/premium/state/PremiumEntitlementProvider";
import { useCustomizationSettingsSelector } from "../state/CustomizationSettingsProvider";
import {
  getCustomizationHapticsToggleCommand,
  getCustomizationScreenState,
  getSettingsInteractionCommand,
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
    sendHaptic(getSettingsInteractionCommand().haptic);
    void setTheme(themeKey);
  };

  const updateAppIcon = (appIcon: CustomizationColorKey) => {
    sendHaptic(getSettingsInteractionCommand().haptic);
    void setAppIcon(appIcon);
  };

  const updateHapticsEnabled = (hapticsEnabled: boolean) => {
    const command = getCustomizationHapticsToggleCommand({
      hapticsEnabled: customizationState.settings.hapticsEnabled,
    });

    if (command) {
      sendHaptic(command.haptic);
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
