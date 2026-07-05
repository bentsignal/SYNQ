import type { ImportReviewRequestState } from "./import-review-request-executor-service";

export const defaultImportReviewRequestState: ImportReviewRequestState = {
  importCount: 0,
  reviewAlreadyRequested: false,
};

export const normalizeImportReviewRequestState = (
  value: unknown,
): ImportReviewRequestState => {
  if (!value || typeof value !== "object") {
    return defaultImportReviewRequestState;
  }

  const state = value as Partial<ImportReviewRequestState>;

  return {
    importCount:
      typeof state.importCount === "number" && Number.isFinite(state.importCount)
        ? Math.max(0, Math.trunc(state.importCount))
        : 0,
    reviewAlreadyRequested: state.reviewAlreadyRequested === true,
  };
};
