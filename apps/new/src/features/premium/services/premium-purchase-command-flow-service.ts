import type {
  PremiumEntitlementStatus,
  PremiumPurchaseResult,
  PremiumTierId,
} from "../types/premium-purchase";
import { getPremiumMutationErrorMessage } from "./premium-screen-service";
import type { PremiumPurchaseAction } from "./premium-purchase-state-service";

type PremiumPurchaseDispatch = (action: PremiumPurchaseAction) => void;

export const runPremiumTierSelectionCommand = ({
  dispatch,
  tierId,
}: {
  dispatch: PremiumPurchaseDispatch;
  tierId: PremiumTierId;
}) => {
  dispatch({ tierId, type: "select" });
};

export const runPremiumPurchaseCommand = async ({
  applyStatus,
  dispatch,
  purchasePremiumTier,
  selectedTierId,
}: {
  applyStatus: (status: PremiumEntitlementStatus) => void;
  dispatch: PremiumPurchaseDispatch;
  purchasePremiumTier: (tierId: PremiumTierId) => Promise<PremiumPurchaseResult>;
  selectedTierId: PremiumTierId;
}) => {
  dispatch({ type: "start" });

  try {
    const result = await purchasePremiumTier(selectedTierId);
    applyStatus(result);
    dispatch({ result, type: "succeed" });
  } catch (caughtError) {
    dispatch({
      error: getPremiumMutationErrorMessage({
        caughtError,
        mutation: "purchase-tier",
      }),
      type: "fail",
    });
  }
};

export const runPremiumRestoreCommand = async ({
  applyStatus,
  dispatch,
  restorePremiumPurchase,
}: {
  applyStatus: (status: PremiumEntitlementStatus) => void;
  dispatch: PremiumPurchaseDispatch;
  restorePremiumPurchase: () => Promise<PremiumPurchaseResult>;
}) => {
  dispatch({ type: "start" });

  try {
    const result = await restorePremiumPurchase();
    applyStatus(result);
    dispatch({ result, type: "succeed" });
  } catch (caughtError) {
    dispatch({
      error: getPremiumMutationErrorMessage({
        caughtError,
        mutation: "restore-purchase",
      }),
      type: "fail",
    });
  }
};

export const runPremiumPurchaseResetCommand = ({
  dispatch,
}: {
  dispatch: PremiumPurchaseDispatch;
}) => {
  dispatch({ type: "reset" });
};
