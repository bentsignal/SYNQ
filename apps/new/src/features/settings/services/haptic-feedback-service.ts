import * as Haptics from "expo-haptics";

export type HapticFeedbackType =
  | "error"
  | "heavy"
  | "light"
  | "medium"
  | "rigid"
  | "soft"
  | "success";

export function sendNativeHaptic(type: HapticFeedbackType) {
  switch (type) {
    case "light":
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    case "medium":
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    case "heavy":
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    case "success":
      return Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      );
    case "error":
      return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    case "soft":
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    case "rigid":
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
  }
}
