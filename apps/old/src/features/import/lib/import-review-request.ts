import CFG from "@/src/constants/Config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";

const IMPORT_COUNT_KEY = "importCount";
const REVIEW_ALREADY_REQUESTED_KEY = "reviewAlreadyRequested";

const requestStoreReview = async (): Promise<boolean> => {
  const available = await StoreReview.isAvailableAsync();
  if (available) {
    await StoreReview.requestReview();
    await AsyncStorage.setItem(REVIEW_ALREADY_REQUESTED_KEY, "true");
    return true;
  }

  return false;
};

export async function requestImportReviewIfEligible(
  premium: boolean,
): Promise<boolean> {
  try {
    const countStr = await AsyncStorage.getItem(IMPORT_COUNT_KEY);
    const reviewAlreadyRequested = await AsyncStorage.getItem(
      REVIEW_ALREADY_REQUESTED_KEY,
    );
    const requested = reviewAlreadyRequested === "true";
    if (requested) return false;

    if (premium) {
      return requestStoreReview();
    }

    if (countStr) {
      const count = parseInt(countStr) + 1;
      await AsyncStorage.setItem(IMPORT_COUNT_KEY, count.toString());
      if (count >= CFG.showReviewAfter) {
        return requestStoreReview();
      }

      return false;
    }

    await AsyncStorage.setItem(IMPORT_COUNT_KEY, "1");
    if (CFG.showReviewAfter <= 1) {
      return requestStoreReview();
    }

    return false;
  } catch {
    return false;
  }
}
