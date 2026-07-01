import AsyncStorage from "@react-native-async-storage/async-storage";

const hapticPreferenceKey = "haptic";

export const getStoredHapticPreference = () => {
  return AsyncStorage.getItem(hapticPreferenceKey);
};

export const setStoredHapticPreference = (enabled: boolean) => {
  return AsyncStorage.setItem(hapticPreferenceKey, enabled.toString());
};
