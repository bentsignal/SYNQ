import { useCallback, useMemo } from "react";
import {
  purchasePremiumTier,
  restorePremiumPurchase,
} from "../services/premium-purchase-service";
import {
  runPremiumPurchaseCommand,
  runPremiumPurchaseResetCommand,
  runPremiumRestoreCommand,
} from "../services/premium-purchase-command-flow-service";
import type { PremiumPurchaseAction } from "../services/premium-purchase-action-service";
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
    await runPremiumPurchaseCommand({
      applyStatus,
      dispatch,
      purchasePremiumTier,
      selectedTierId,
    });
  }, [applyStatus, dispatch, selectedTierId]);

  const restorePurchase = useCallback(async () => {
    await runPremiumRestoreCommand({
      applyStatus,
      dispatch,
      restorePremiumPurchase,
    });
  }, [applyStatus, dispatch]);

  const reset = useCallback(() => {
    runPremiumPurchaseResetCommand({ dispatch });
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
