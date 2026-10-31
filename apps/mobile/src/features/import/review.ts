import * as StoreReview from "expo-store-review";

import { getBookkeeping, updateBookkeeping } from "./bookkeeping";

/** 2.5.2 asked after the first finished import (`showReviewAfter: 1`). */
const REVIEW_AFTER_IMPORTS = 1;

/** Lets the import sheet finish closing before iOS shows the prompt. */
const PROMPT_DELAY_MS = 600;

/**
 * Counts a finished import batch and, once (ever, including on 2.5.2),
 * asks for an App Store review.
 */
export function recordFinishedImport() {
  const { importCount, reviewRequested } = updateBookkeeping({
    importCount: getBookkeeping().importCount + 1,
  });
  if (reviewRequested || importCount < REVIEW_AFTER_IMPORTS) return;
  setTimeout(() => {
    void StoreReview.isAvailableAsync()
      .then(async (available) => {
        if (!available) return;
        await StoreReview.requestReview();
        updateBookkeeping({ reviewRequested: true });
      })
      .catch(() => undefined);
  }, PROMPT_DELAY_MS);
}
