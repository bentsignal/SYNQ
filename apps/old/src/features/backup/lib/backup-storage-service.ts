import AsyncStorage from "@react-native-async-storage/async-storage";

export const clearStoredAppState = () => {
  return AsyncStorage.clear();
};
