import type {
  PremiumPurchaseState,
  PremiumTier,
} from "../types/premium-purchase";

export const premiumFeatureCopy = [
  "Unlimited library import",
  "Backup and restore",
  "Customization controls",
  "Support future SYNQ development",
];

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

export const getPremiumStatusState = (state: PremiumPurchaseState) => ({
  canReset: state.phase === "failure",
  isFailure: state.phase === "failure",
  message:
    state.error ??
    state.message ??
    (state.active
      ? "Premium is active."
      : "Choose a plan or restore a previous purchase."),
});
