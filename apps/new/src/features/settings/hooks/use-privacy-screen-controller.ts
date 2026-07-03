import {
  getPrivacyScreenState,
} from "../services/settings-screen-service";
import { runSettingsInteractionAction } from "../services/settings-interaction-action-flow-service";
import { useHapticFeedback } from "./use-haptic-feedback";
import { usePrivacySettings } from "./use-privacy-settings";

export function usePrivacyScreenController() {
  const { sendHaptic } = useHapticFeedback();
  const { setAllowAnalytics, state } = usePrivacySettings();
  const screenState = getPrivacyScreenState({ status: state.status });

  const updateAllowAnalytics = (allowAnalytics: boolean) => {
    void runSettingsInteractionAction({
      action: () => setAllowAnalytics(allowAnalytics),
      sendHaptic,
    });
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
