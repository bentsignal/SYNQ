import type {
  PremiumPurchaseState,
  PremiumTier,
} from "../types/premium-purchase";

export const getSelectedPremiumTier = ({
  state,
  tiers,
}: {
  state: PremiumPurchaseState;
  tiers: PremiumTier[];
}) => tiers.find((tier) => tier.id === state.selectedTierId) ?? null;

export const getPremiumActionState = ({
  selectedTier,
  state,
}: {
  selectedTier: PremiumTier | null;
  state: PremiumPurchaseState;
}) => {
  const isLoading = state.phase === "loading";

  return {
    canPurchase: !isLoading,
    canRestore: !isLoading,
    purchaseLabel: selectedTier ? `Choose ${selectedTier.label}` : "Choose plan",
  };
};

export type PremiumActionState = ReturnType<typeof getPremiumActionState>;
