import { usePreferences } from "@/src/stores/preferences";
import * as Haptics from "expo-haptics";

type HapticType =
  | "light"
  | "medium"
  | "heavy"
  | "success"
  | "error"
  | "soft"
  | "rigid";

export const useHaptics = () => {
  const sendHaptic = (type: HapticType) => {
    const hapticsEnabled = usePreferences.getState().hapticFeedback;

    if (!hapticsEnabled) return;

    switch (type) {
      case "light":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case "medium":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case "heavy":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case "success":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case "error":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case "soft":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        break;
      case "rigid":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
        break;
      default:
        break;
    }
  };

  return { sendHaptic };
};
