import { usePremiumPurchaseSession } from "./use-premium-purchase-session";
import { getPremiumViewState } from "../services/premium-screen-service";

export function usePremiumScreenController() {
  const {
    premiumTiers,
    purchaseSelectedTier,
    reset,
    restorePurchase,
    selectTier,
    state,
  } = usePremiumPurchaseSession();
  const { actionState, screenState, statusState } = getPremiumViewState({
    state,
    tiers: premiumTiers,
  });

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
    screenState,
    selectTier,
    state,
    statusState,
  };
}

export type PremiumScreenController = ReturnType<
  typeof usePremiumScreenController
>;
