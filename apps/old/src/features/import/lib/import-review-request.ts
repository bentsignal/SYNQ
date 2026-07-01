import CFG from "@/src/constants/Config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";

const IMPORT_COUNT_KEY = "importCount";
const REVIEW_ALREADY_REQUESTED_KEY = "reviewAlreadyRequested";

const requestStoreReview = async () => {
  const available = await StoreReview.isAvailableAsync();
  if (available) {
    await StoreReview.requestReview();
    await AsyncStorage.setItem(REVIEW_ALREADY_REQUESTED_KEY, "true");
  }
};

export async function requestImportReviewIfEligible(premium: boolean) {
  try {
    const countStr = await AsyncStorage.getItem(IMPORT_COUNT_KEY);
    const reviewAlreadyRequested = await AsyncStorage.getItem(
      REVIEW_ALREADY_REQUESTED_KEY,
    );
    const requested = reviewAlreadyRequested === "true";
    if (requested) return;

    if (premium) {
      await requestStoreReview();
      return;
    }

    if (countStr) {
      const count = parseInt(countStr) + 1;
      await AsyncStorage.setItem(IMPORT_COUNT_KEY, count.toString());
      if (count >= CFG.showReviewAfter) {
        await requestStoreReview();
      }
      return;
    }

    await AsyncStorage.setItem(IMPORT_COUNT_KEY, "1");
    if (CFG.showReviewAfter <= 1) {
      await requestStoreReview();
    }
  } catch (error) {
    console.log("Error requesting app store review:", error);
  }
}
