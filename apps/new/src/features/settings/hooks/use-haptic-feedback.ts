import { useCallback } from "react";
import {
  sendNativeHaptic,
  type HapticFeedbackType,
} from "../services/haptic-feedback-service";
import { useCustomizationSettingsSelector } from "../context/CustomizationSettingsProvider";

export function useHapticFeedback() {
  const hapticsEnabled = useCustomizationSettingsSelector(
    (store) => store.state.settings.hapticsEnabled,
  );

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
