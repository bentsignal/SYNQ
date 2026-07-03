import {
  supportActions,
  type SupportAction,
} from "../services/settings-navigation-service";
import { getSettingsInteractionCommand } from "../services/settings-screen-service";
import { runSettingsSupportAction } from "../services/settings-support-action-service";
import { useHapticFeedback } from "./use-haptic-feedback";

export function useSupportScreenController() {
  const { sendHaptic } = useHapticFeedback();

  const runSupportAction = (action: SupportAction) => {
    sendHaptic(getSettingsInteractionCommand().haptic);
    void runSettingsSupportAction(action);
  };

  return {
    runSupportAction,
    supportActions,
  };
}

export type SupportScreenController = ReturnType<
  typeof useSupportScreenController
>;
