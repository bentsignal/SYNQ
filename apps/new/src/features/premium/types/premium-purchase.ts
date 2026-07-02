export type PremiumTierId = "lifetime" | "monthly" | "yearly";

export type PremiumPurchasePhase = "failure" | "idle" | "loading" | "success";

export type PremiumTier = {
  description: string;
  id: PremiumTierId;
  label: string;
  price: string;
};

export type PremiumPurchaseState = {
  active: boolean;
  error: string | null;
  message: string | null;
  phase: PremiumPurchasePhase;
  selectedTierId: PremiumTierId;
};

export type PremiumPurchaseResult = {
  active: boolean;
  message: string;
  tierId: PremiumTierId;
};
