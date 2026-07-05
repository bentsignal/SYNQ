import { getImportReviewRequestAttemptState } from "./import-review-request-attempt-state-service";
import { normalizeImportReviewRequestState } from "./import-review-request-normalizer-service";
import { runImportReviewRequestAttempt } from "./import-review-request-runtime-service";

export type ImportReviewRequestState = {
  importCount: number;
  reviewAlreadyRequested: boolean;
};

export type ImportReviewRequestDependencies = {
  isReviewAvailable: () => Promise<boolean>;
  loadState: () => Promise<ImportReviewRequestState>;
  requestReview: () => Promise<void>;
  saveState: (state: ImportReviewRequestState) => Promise<void>;
};

export type ImportReviewRequestOptions = {
  premiumActive: boolean;
  showReviewAfter: number;
};

export async function requestImportReviewIfEligibleWithDependencies({
  dependencies,
  options,
}: {
  dependencies: ImportReviewRequestDependencies;
  options: ImportReviewRequestOptions;
}): Promise<boolean> {
  try {
    const state = normalizeImportReviewRequestState(
      await dependencies.loadState(),
    );
    const attempt = getImportReviewRequestAttemptState({ options, state });

    return await runImportReviewRequestAttempt({
      dependencies,
      nextState: attempt.nextState,
      shouldRequest: attempt.shouldRequest,
    });
  } catch {
    return false;
  }
}

export { getImportReviewRequestAttemptState } from "./import-review-request-attempt-state-service";
export {
  defaultImportReviewRequestState,
  normalizeImportReviewRequestState,
} from "./import-review-request-normalizer-service";
