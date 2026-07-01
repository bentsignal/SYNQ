import AsyncStorage from "@react-native-async-storage/async-storage";

const themeStorageKey = "theme";

export const getStoredTheme = () => {
  return AsyncStorage.getItem(themeStorageKey);
};

export const setStoredTheme = (theme: string) => {
  return AsyncStorage.setItem(themeStorageKey, theme);
};
