import type {
  ImportReviewRequestOptions,
  ImportReviewRequestState,
} from "./import-review-request-executor-service";

export const getImportReviewRequestAttemptState = ({
  options,
  state,
}: {
  options: ImportReviewRequestOptions;
  state: ImportReviewRequestState;
}) => {
  if (state.reviewAlreadyRequested) {
    return { nextState: state, shouldRequest: false };
  }

  if (options.premiumActive) {
    return { nextState: state, shouldRequest: true };
  }

  const nextState = {
    ...state,
    importCount: state.importCount + 1,
  };

  return {
    nextState,
    shouldRequest: nextState.importCount >= options.showReviewAfter,
  };
};
