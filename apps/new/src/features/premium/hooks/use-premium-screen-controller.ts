import { usePremiumPurchaseSession } from "./use-premium-purchase-session";
import {
  getPremiumActionState,
  getPremiumStatusState,
  getSelectedPremiumTier,
} from "../services/premium-screen-service";

export function usePremiumScreenController() {
  const {
    premiumTiers,
    purchaseSelectedTier,
    reset,
    restorePurchase,
    selectTier,
    state,
  } = usePremiumPurchaseSession();
  const selectedTier = getSelectedPremiumTier({ state, tiers: premiumTiers });
  const actionState = getPremiumActionState({ selectedTier, state });
  const statusState = getPremiumStatusState(state);

  const purchase = () => {
    void purchaseSelectedTier();
  };

  const restore = () => {
    void restorePurchase();
  };

  return {
    actionState,
    premiumTiers,
    purchase,
    reset,
    restore,
    selectTier,
    state,
    statusState,
  };
}

export type PremiumScreenController = ReturnType<
  typeof usePremiumScreenController
>;
