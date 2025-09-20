import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { create } from "zustand";

type HapticType =
  | "light"
  | "medium"
  | "heavy"
  | "success"
  | "error"
  | "soft"
  | "rigid";

interface HapticStoreProps {
  loadHapticFeedbackPreference: () => void;
  hapticFeedbackEnabled: boolean;
  toggleHapticFeedback: () => void;
}

export const useHapticStore = create<HapticStoreProps>((set, get) => ({
  loadHapticFeedbackPreference: async () => {
    const hapticPreference = await AsyncStorage.getItem("haptic");
    set({ hapticFeedbackEnabled: hapticPreference === "true" });
  },
  hapticFeedbackEnabled: true,
  toggleHapticFeedback: async () => {
    const currentValue = get().hapticFeedbackEnabled;
    set({ hapticFeedbackEnabled: !currentValue });
    await AsyncStorage.setItem("haptic", (!currentValue).toString());
  },
}));

export const useHaptics = () => {
  const sendHaptic = (type: HapticType) => {
    const hapticFeedbackEnabled =
      useHapticStore.getState().hapticFeedbackEnabled;

    if (!hapticFeedbackEnabled) return;

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
