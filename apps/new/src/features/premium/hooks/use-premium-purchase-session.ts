import { useCallback, useEffect, useMemo, useReducer } from "react";
import { premiumTiers } from "../services/premium-purchase-service";
import {
  getInitialPremiumPurchaseState,
  getInitialPremiumTierLoadState,
  premiumPurchaseReducer,
  premiumTierLoadReducer,
} from "../services/premium-purchase-state-service";
import type { PremiumTierId } from "../types/premium-purchase";
import { usePremiumEntitlementSelector } from "../context/PremiumEntitlementProvider";
import { usePremiumPurchaseCommands } from "./use-premium-purchase-commands";
import { usePremiumTierLoader } from "./use-premium-tier-loader";

export function usePremiumPurchaseSession() {
  const applyStatus = usePremiumEntitlementSelector(
    (store) => store.applyStatus,
  );
  const entitlementState = usePremiumEntitlementSelector(
    (store) => store.state,
  );
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

  usePremiumTierLoader({ dispatchTierState });

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

  const { purchaseSelectedTier, reset, restorePurchase } =
    usePremiumPurchaseCommands({
      applyStatus,
      dispatch,
      selectedTierId: state.selectedTierId,
    });

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
