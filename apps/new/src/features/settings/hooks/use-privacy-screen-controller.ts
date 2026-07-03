import {
  getPrivacyScreenState,
  getSettingsInteractionCommand,
} from "../services/settings-screen-service";
import { useHapticFeedback } from "./use-haptic-feedback";
import { usePrivacySettings } from "./use-privacy-settings";

export function usePrivacyScreenController() {
  const { sendHaptic } = useHapticFeedback();
  const { setAllowAnalytics, state } = usePrivacySettings();
  const screenState = getPrivacyScreenState({ status: state.status });

  const updateAllowAnalytics = (allowAnalytics: boolean) => {
    sendHaptic(getSettingsInteractionCommand().haptic);
    void setAllowAnalytics(allowAnalytics);
  };

  return {
    screenState,
    state,
    updateAllowAnalytics,
  };
}

export type PrivacyScreenController = ReturnType<
  typeof usePrivacyScreenController
>;
