import { useCallback, useMemo } from "react";
import {
  purchasePremiumTier,
  restorePremiumPurchase,
} from "../services/premium-purchase-service";
import type { PremiumPurchaseAction } from "../services/premium-purchase-state-service";
import { getPremiumMutationErrorMessage } from "../services/premium-screen-service";
import type {
  PremiumEntitlementStatus,
  PremiumTierId,
} from "../types/premium-purchase";

type UsePremiumPurchaseCommandsParams = {
  applyStatus: (status: PremiumEntitlementStatus) => void;
  dispatch: React.Dispatch<PremiumPurchaseAction>;
  selectedTierId: PremiumTierId;
};

export function usePremiumPurchaseCommands({
  applyStatus,
  dispatch,
  selectedTierId,
}: UsePremiumPurchaseCommandsParams) {
  const purchaseSelectedTier = useCallback(async () => {
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
  }, [applyStatus, dispatch, selectedTierId]);

  const restorePurchase = useCallback(async () => {
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
  }, [applyStatus, dispatch]);

  const reset = useCallback(() => {
    dispatch({ type: "reset" });
  }, [dispatch]);

  return useMemo(
    () => ({
      purchaseSelectedTier,
      reset,
      restorePurchase,
    }),
    [purchaseSelectedTier, reset, restorePurchase],
  );
}
