import { usePremiumEntitlementSelector } from "@/src/features/premium/state/PremiumEntitlementProvider";
import { useCustomizationSettingsSelector } from "../state/CustomizationSettingsProvider";
import {
  getCustomizationScreenControllerViewState,
} from "../services/customization-screen-state-service";
import {
  runCustomizationHapticsToggleAction,
  runSettingsInteractionAction,
} from "../services/settings-interaction-action-flow-service";
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
  const { colorControlsState, screenState } =
    getCustomizationScreenControllerViewState({
      premiumActive,
      settings: customizationState.settings,
      status: customizationState.status,
    });

  const updateTheme = (themeKey: CustomizationColorKey) => {
    void runSettingsInteractionAction({
      action: () => setTheme(themeKey),
      sendHaptic,
    });
  };

  const updateAppIcon = (appIcon: CustomizationColorKey) => {
    void runSettingsInteractionAction({
      action: () => setAppIcon(appIcon),
      sendHaptic,
    });
  };

  const updateHapticsEnabled = (hapticsEnabled: boolean) => {
    void runCustomizationHapticsToggleAction({
      currentHapticsEnabled: customizationState.settings.hapticsEnabled,
      nextHapticsEnabled: hapticsEnabled,
      sendHaptic,
      setHapticsEnabled,
    });
  };

  return {
    colorControlsState,
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
