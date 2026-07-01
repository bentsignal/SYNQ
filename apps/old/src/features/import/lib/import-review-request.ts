import CFG from "@/src/constants/Config";
import {
  getStoredImportCount,
  getStoredReviewAlreadyRequested,
  setStoredImportCount,
  setStoredReviewAlreadyRequested,
} from "@/src/features/import/lib/import-review-storage-service";
import * as StoreReview from "expo-store-review";

const requestStoreReview = async (): Promise<boolean> => {
  const available = await StoreReview.isAvailableAsync();
  if (available) {
    await StoreReview.requestReview();
    await setStoredReviewAlreadyRequested();
    return true;
  }

  return false;
};

export async function requestImportReviewIfEligible(
  premium: boolean,
): Promise<boolean> {
  try {
    const countStr = await getStoredImportCount();
    const reviewAlreadyRequested = await getStoredReviewAlreadyRequested();
    const requested = reviewAlreadyRequested === "true";
    if (requested) return false;

    if (premium) {
      return requestStoreReview();
    }

    if (countStr) {
      const count = parseInt(countStr) + 1;
      await setStoredImportCount(count);
      if (count >= CFG.showReviewAfter) {
        return requestStoreReview();
      }

      return false;
    }

    await setStoredImportCount(1);
    if (CFG.showReviewAfter <= 1) {
      return requestStoreReview();
    }

    return false;
  } catch {
    return false;
  }
}
