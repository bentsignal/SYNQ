import {
  getStoredHapticPreference,
  setStoredHapticPreference,
} from "@/src/features/haptics/lib/haptic-preference-storage-service";
import * as Haptics from "expo-haptics";
import { useCallback } from "react";
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
  hapticFeedbackEnabled: boolean;
  setHapticFeedbackEnabled: (enabled: boolean) => void;
  toggleHapticFeedback: () => void;
}

export const useHapticStore = create<HapticStoreProps>((set, get) => ({
  hapticFeedbackEnabled: true,
  setHapticFeedbackEnabled: (enabled: boolean) => {
    set({ hapticFeedbackEnabled: enabled });
  },
  toggleHapticFeedback: async () => {
    const currentValue = get().hapticFeedbackEnabled;
    set({ hapticFeedbackEnabled: !currentValue });
    await setStoredHapticPreference(!currentValue);
  },
}));

export const useHaptics = () => {
  const setHapticFeedbackEnabled = useHapticStore(
    (state) => state.setHapticFeedbackEnabled,
  );

  const loadHapticFeedbackPreference = useCallback(async () => {
    const hapticPreference = await getStoredHapticPreference();
    setHapticFeedbackEnabled(hapticPreference === "true");
  }, [setHapticFeedbackEnabled]);

  const sendHaptic = useCallback((type: HapticType) => {
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
  }, []);

  return { sendHaptic, loadHapticFeedbackPreference };
};
