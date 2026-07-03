import { useCallback, useEffect, useMemo, useReducer } from "react";
import { premiumTiers } from "../services/premium-purchase-service";
import {
  getInitialPremiumPurchaseState,
  getPremiumPurchaseSelectAction,
  getPremiumPurchaseSyncEntitlementAction,
  premiumPurchaseReducer,
} from "../services/premium-purchase-state-service";
import {
  getInitialPremiumTierLoadState,
  premiumTierLoadReducer,
} from "../services/premium-tier-load-state-service";
import type { PremiumTierId } from "../types/premium-purchase";
import { usePremiumEntitlementSelector } from "../state/PremiumEntitlementProvider";
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
    dispatch(getPremiumPurchaseSyncEntitlementAction({
      active: entitlementState.active,
      message: entitlementState.message,
      tierId: entitlementState.tierId,
    }));
  }, [entitlementState.active, entitlementState.message, entitlementState.tierId]);

  const selectTier = useCallback((tierId: PremiumTierId) => {
    dispatch(getPremiumPurchaseSelectAction(tierId));
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
