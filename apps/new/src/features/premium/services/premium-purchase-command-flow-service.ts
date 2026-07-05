import type {
  PremiumEntitlementStatus,
  PremiumPurchaseResult,
  PremiumTierId,
} from "../types/premium-purchase";
import {
  getPremiumMutationErrorMessage,
  type PremiumMutationKind,
} from "./premium-mutation-error-service";
import {
  getPremiumPurchaseFailAction,
  getPremiumPurchaseResetAction,
  getPremiumPurchaseSelectAction,
  getPremiumPurchaseStartAction,
  getPremiumPurchaseSucceedAction,
  type PremiumPurchaseAction,
} from "./premium-purchase-state-service";

type PremiumPurchaseDispatch = (action: PremiumPurchaseAction) => void;

const runPremiumPurchaseMutationAttempt = async ({
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
