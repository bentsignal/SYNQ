import { useCallback } from "react";
import {
  sendNativeHaptic,
  type HapticFeedbackType,
} from "../services/haptic-feedback-service";
import { useCustomizationSettingsContext } from "../context/CustomizationSettingsProvider";

export function useHapticFeedback() {
  const { state } = useCustomizationSettingsContext();
  const hapticsEnabled = state.settings.hapticsEnabled;

  const sendHaptic = useCallback(
    (type: HapticFeedbackType) => {
      if (!hapticsEnabled) {
        return;
      }

      void sendNativeHaptic(type);
    },
    [hapticsEnabled],
  );

  return { hapticsEnabled, sendHaptic };
}
