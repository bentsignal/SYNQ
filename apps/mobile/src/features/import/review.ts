import * as StoreReview from "expo-store-review";

import { getBookkeeping, updateBookkeeping } from "./bookkeeping";

/** 2.5.2 asked after the first finished import (`showReviewAfter: 1`). */
const REVIEW_AFTER_IMPORTS = 1;

/** Lets a closing sheet finish before iOS shows the prompt. */
const PROMPT_DELAY_MS = 600;

/**
 * Counts a finished import batch and, once (ever, including on 2.5.2),
 * asks for an App Store review, unless the batch had failures to report:
 * the next clean one asks instead.
 */
export function recordFinishedImport({
  mayAskForReview,
}: {
  mayAskForReview: boolean;
}) {
  const { importCount, reviewRequested } = updateBookkeeping({
    importCount: getBookkeeping().importCount + 1,
  });
  if (!mayAskForReview) return;
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
