import * as StoreReview from "expo-store-review";

import { getBookkeeping, updateBookkeeping } from "./bookkeeping";

/** 2.5.2 asked after the first finished import (`showReviewAfter: 1`). */
const REVIEW_AFTER_IMPORTS = 1;

/** Lets the new songs land, and be looked at, before iOS shows the prompt. */
const PROMPT_DELAY_MS = 1800;

/**
 * Counts a finished import batch and, once (ever, including on 2.5.2),
 * asks for an App Store review after its songs have appeared, unless the
 * batch had failures to report or another import has started by then: the
 * next clean one asks instead.
 */
export function recordFinishedImport({
  appeared,
  isImporting,
  mayAskForReview,
}: {
  /** Settles once the batch's songs are on screen. */
  appeared: Promise<unknown>;
  isImporting: () => boolean;
  mayAskForReview: boolean;
}) {
  const { importCount, reviewRequested } = updateBookkeeping({
    importCount: getBookkeeping().importCount + 1,
  });
  if (!mayAskForReview) return;
  if (reviewRequested || importCount < REVIEW_AFTER_IMPORTS) return;
  void appeared
    .catch(() => undefined)
    .then(() => {
      setTimeout(() => {
        if (isImporting()) return;
        void StoreReview.isAvailableAsync()
          .then(async (available) => {
            if (!available) return;
            await StoreReview.requestReview();
            updateBookkeeping({ reviewRequested: true });
          })
          .catch(() => undefined);
      }, PROMPT_DELAY_MS);
    });
}
