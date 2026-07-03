import {
  supportActions,
  type SupportAction,
} from "../services/settings-navigation-service";
import { runSettingsInteractionAction } from "../services/settings-interaction-action-flow-service";
import { runSettingsSupportAction } from "../services/settings-support-action-service";
import { useHapticFeedback } from "./use-haptic-feedback";

export function useSupportScreenController() {
  const { sendHaptic } = useHapticFeedback();

  const runSupportAction = (action: SupportAction) => {
    void runSettingsInteractionAction({
      action: () => runSettingsSupportAction(action),
      sendHaptic,
    });
  };

  return {
    runSupportAction,
    supportActions,
  };
}

export type SupportScreenController = ReturnType<
  typeof useSupportScreenController
>;
