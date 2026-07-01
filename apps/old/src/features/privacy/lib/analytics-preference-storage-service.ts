import AsyncStorage from "@react-native-async-storage/async-storage";

const allowAnalyticsStorageKey = "allowAnalytics";

export const getStoredAnalyticsPreference = () => {
  return AsyncStorage.getItem(allowAnalyticsStorageKey);
};

export const setStoredAnalyticsPreference = (allowAnalytics: boolean) => {
  return AsyncStorage.setItem(
    allowAnalyticsStorageKey,
    allowAnalytics.toString(),
  );
};
