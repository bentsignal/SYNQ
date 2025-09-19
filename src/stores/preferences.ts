import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

interface Preferences {
  initializePreferences: () => void;
  hapticFeedback: boolean;
  toggleHapticFeedback: () => void;
}

export const usePreferences = create<Preferences>((set, get) => ({
  initializePreferences: async () => {
    const hapticFeedback = await AsyncStorage.getItem("haptic");
    set({ hapticFeedback: hapticFeedback === "true" });
  },
  hapticFeedback: true,
  toggleHapticFeedback: async () => {
    const currentValue = get().hapticFeedback!;
    set({ hapticFeedback: !currentValue });
    await AsyncStorage.setItem("haptic", (!currentValue).toString());
  },
}));
