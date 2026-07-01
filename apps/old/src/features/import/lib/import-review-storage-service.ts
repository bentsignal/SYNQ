import AsyncStorage from "@react-native-async-storage/async-storage";

const importCountKey = "importCount";
const reviewAlreadyRequestedKey = "reviewAlreadyRequested";

export const getStoredImportCount = () => {
  return AsyncStorage.getItem(importCountKey);
};

export const setStoredImportCount = (count: number) => {
  return AsyncStorage.setItem(importCountKey, count.toString());
};

export const getStoredReviewAlreadyRequested = () => {
  return AsyncStorage.getItem(reviewAlreadyRequestedKey);
};

export const setStoredReviewAlreadyRequested = () => {
  return AsyncStorage.setItem(reviewAlreadyRequestedKey, "true");
};
