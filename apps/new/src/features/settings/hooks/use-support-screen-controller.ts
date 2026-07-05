import {
  type SupportAction,
} from "../services/settings-support-navigation-service";
import { runSettingsInteractionAction } from "../services/settings-interaction-action-flow-service";
import { getSupportScreenControllerViewState } from "../services/settings-support-screen-service";
import { runSettingsSupportAction } from "../services/settings-support-action-service";
import { useHapticFeedback } from "./use-haptic-feedback";

export function useSupportScreenController() {
  const { sendHaptic } = useHapticFeedback();
  const { actionRows, viewState } = getSupportScreenControllerViewState();

  const runSupportAction = (action: SupportAction) => {
    void runSettingsInteractionAction({
      action: () => runSettingsSupportAction(action),
      sendHaptic,
    });
  };

  return {
    actionRows,
    runSupportAction,
    viewState,
  };
}

export type SupportScreenController = ReturnType<
  typeof useSupportScreenController
>;
