import type {
  PremiumEntitlementStatus,
  PremiumPurchaseResult,
  PremiumTierId,
} from "../types/premium-purchase";
import { getPremiumMutationErrorMessage } from "./premium-screen-service";
import {
  getPremiumPurchaseFailAction,
  getPremiumPurchaseResetAction,
  getPremiumPurchaseSelectAction,
  getPremiumPurchaseStartAction,
  getPremiumPurchaseSucceedAction,
  type PremiumPurchaseAction,
} from "./premium-purchase-state-service";

type PremiumPurchaseDispatch = (action: PremiumPurchaseAction) => void;

export const runPremiumTierSelectionCommand = ({
  dispatch,
  tierId,
}: {
  dispatch: PremiumPurchaseDispatch;
  tierId: PremiumTierId;
}) => {
  dispatch(getPremiumPurchaseSelectAction(tierId));
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
  dispatch(getPremiumPurchaseStartAction());

  try {
    const result = await purchasePremiumTier(selectedTierId);
    applyStatus(result);
    dispatch(getPremiumPurchaseSucceedAction(result));
  } catch (caughtError) {
    dispatch(
      getPremiumPurchaseFailAction(
        getPremiumMutationErrorMessage({
          caughtError,
          mutation: "purchase-tier",
        }),
      ),
    );
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
  dispatch(getPremiumPurchaseStartAction());

  try {
    const result = await restorePremiumPurchase();
    applyStatus(result);
    dispatch(getPremiumPurchaseSucceedAction(result));
  } catch (caughtError) {
    dispatch(
      getPremiumPurchaseFailAction(
        getPremiumMutationErrorMessage({
          caughtError,
          mutation: "restore-purchase",
        }),
      ),
    );
  }
};

export const runPremiumPurchaseResetCommand = ({
  dispatch,
}: {
  dispatch: PremiumPurchaseDispatch;
}) => {
  dispatch(getPremiumPurchaseResetAction());
};
