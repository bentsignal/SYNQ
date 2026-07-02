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

export type PremiumActionState = ReturnType<typeof getPremiumActionState>;

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

export type PremiumStatusState = ReturnType<typeof getPremiumStatusState>;

export type PremiumMutationKind =
  | "check-entitlement"
  | "purchase-tier"
  | "restore-purchase";

export const getPremiumMutationErrorMessage = ({
  caughtError,
  mutation,
}: {
  caughtError: unknown;
  mutation: PremiumMutationKind;
}) => {
  if (caughtError instanceof Error) {
    return caughtError.message;
  }

  switch (mutation) {
    case "check-entitlement":
      return "Premium entitlement could not be checked.";
    case "purchase-tier":
      return "Premium purchase failed.";
    case "restore-purchase":
      return "Premium restore failed.";
  }
};
