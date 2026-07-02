import { useCallback, useEffect, useMemo, useReducer } from "react";
import {
  loadPremiumTiers,
  premiumTiers,
  purchasePremiumTier,
  restorePremiumPurchase,
} from "../services/premium-purchase-service";
import {
  getInitialPremiumPurchaseState,
  getInitialPremiumTierLoadState,
  premiumPurchaseReducer,
  premiumTierLoadReducer,
} from "../services/premium-purchase-state-service";
import { getPremiumMutationErrorMessage } from "../services/premium-screen-service";
import type { PremiumTierId } from "../types/premium-purchase";
import { usePremiumEntitlement } from "../context/PremiumEntitlementProvider";

export function usePremiumPurchaseSession() {
  const { applyStatus, state: entitlementState } = usePremiumEntitlement();
  const [state, dispatch] = useReducer(
    premiumPurchaseReducer,
    getInitialPremiumPurchaseState({
      active: entitlementState.active,
      tierId: entitlementState.tierId,
    }),
  );
  const [tierState, dispatchTierState] = useReducer(
    premiumTierLoadReducer,
    premiumTiers,
    getInitialPremiumTierLoadState,
  );

  useEffect(() => {
    let isMounted = true;

    const loadTiers = async () => {
      try {
        const nextTiers = await loadPremiumTiers();
        if (isMounted) {
          dispatchTierState({
            tiers: nextTiers,
            type: "resolve",
          });
        }
      } catch {
        if (isMounted) {
          dispatchTierState({
            tiers: premiumTiers,
            type: "resolve",
          });
        }
      }
    };

    void loadTiers();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    dispatch({
      active: entitlementState.active,
      message: entitlementState.message,
      tierId: entitlementState.tierId,
      type: "sync-entitlement",
    });
  }, [entitlementState.active, entitlementState.message, entitlementState.tierId]);

  const selectTier = useCallback((tierId: PremiumTierId) => {
    dispatch({ tierId, type: "select" });
  }, []);

  const purchaseSelectedTier = useCallback(async () => {
    dispatch({ type: "start" });

    try {
      const result = await purchasePremiumTier(state.selectedTierId);
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
  }, [applyStatus, state.selectedTierId]);

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
  }, [applyStatus]);

  const reset = useCallback(() => {
    dispatch({ type: "reset" });
  }, []);

  return useMemo(
    () => ({
      premiumTiers: tierState.tiers,
      purchaseSelectedTier,
      reset,
      restorePurchase,
      selectTier,
      state,
      entitlementState,
    }),
    [
      entitlementState,
      purchaseSelectedTier,
      reset,
      restorePurchase,
      selectTier,
      state,
      tierState.tiers,
    ],
  );
}
