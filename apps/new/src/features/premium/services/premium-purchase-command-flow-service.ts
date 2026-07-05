import type {
  PremiumEntitlementStatus,
  PremiumPurchaseResult,
  PremiumTierId,
} from "../types/premium-purchase";
import {
  getPremiumPurchaseResetAction,
  getPremiumPurchaseSelectAction,
} from "./premium-purchase-action-service";
import {
  runPremiumPurchaseMutationAttempt,
  type PremiumPurchaseDispatch,
} from "./premium-purchase-mutation-runtime-service";

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
  await runPremiumPurchaseMutationAttempt({
    applyStatus,
    dispatch,
    mutation: "purchase-tier",
    run: () => purchasePremiumTier(selectedTierId),
  });
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
  await runPremiumPurchaseMutationAttempt({
    applyStatus,
    dispatch,
    mutation: "restore-purchase",
    run: restorePremiumPurchase,
  });
};

export const runPremiumPurchaseResetCommand = ({
  dispatch,
}: {
  dispatch: PremiumPurchaseDispatch;
}) => {
  dispatch(getPremiumPurchaseResetAction());
};
