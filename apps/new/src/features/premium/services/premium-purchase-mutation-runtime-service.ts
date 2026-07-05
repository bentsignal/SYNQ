import type {
  PremiumEntitlementStatus,
  PremiumPurchaseResult,
} from "../types/premium-purchase";
import {
  getPremiumMutationErrorMessage,
  type PremiumMutationKind,
} from "./premium-mutation-error-service";
import {
  getPremiumPurchaseFailAction,
  getPremiumPurchaseStartAction,
  getPremiumPurchaseSucceedAction,
  type PremiumPurchaseAction,
} from "./premium-purchase-action-service";

export type PremiumPurchaseDispatch = (action: PremiumPurchaseAction) => void;

export const runPremiumPurchaseMutationAttempt = async ({
  applyStatus,
  dispatch,
  mutation,
  run,
}: {
  applyStatus: (status: PremiumEntitlementStatus) => void;
  dispatch: PremiumPurchaseDispatch;
  mutation: Extract<PremiumMutationKind, "purchase-tier" | "restore-purchase">;
  run: () => Promise<PremiumPurchaseResult>;
}) => {
  dispatch(getPremiumPurchaseStartAction());

  try {
    const result = await run();
    applyStatus(result);
    dispatch(getPremiumPurchaseSucceedAction(result));
  } catch (caughtError) {
    dispatch(
      getPremiumPurchaseFailAction(
        getPremiumMutationErrorMessage({
          caughtError,
          mutation,
        }),
      ),
    );
  }
};
