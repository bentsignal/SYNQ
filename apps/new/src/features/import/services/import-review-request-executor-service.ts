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

const defaultImportReviewRequestState: ImportReviewRequestState = {
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

    if (!attempt.shouldRequest) {
      await dependencies.saveState(attempt.nextState);
      return false;
    }

    const available = await dependencies.isReviewAvailable();
    if (!available) {
      await dependencies.saveState(attempt.nextState);
      return false;
    }

    await dependencies.requestReview();
    await dependencies.saveState({
      ...attempt.nextState,
      reviewAlreadyRequested: true,
    });
    return true;
  } catch {
    return false;
  }
}
