import type {
  ImportReviewRequestDependencies,
  ImportReviewRequestState,
} from "./import-review-request-executor-service";

export const runImportReviewRequestAttempt = async ({
  dependencies,
  nextState,
  shouldRequest,
}: {
  dependencies: ImportReviewRequestDependencies;
  nextState: ImportReviewRequestState;
  shouldRequest: boolean;
}): Promise<boolean> => {
  if (!shouldRequest) {
    await dependencies.saveState(nextState);
    return false;
  }

  const available = await dependencies.isReviewAvailable();
  if (!available) {
    await dependencies.saveState(nextState);
    return false;
  }

  await dependencies.requestReview();
  await dependencies.saveState({
    ...nextState,
    reviewAlreadyRequested: true,
  });
  return true;
};
