import type { PremiumTier } from "../types/premium-purchase";
import type { PremiumTierLoadAction } from "./premium-purchase-state-service";

type PremiumTierLoadDispatch = (action: PremiumTierLoadAction) => void;

export const runPremiumTierLoadCommand = async ({
  dispatch,
  fallbackTiers,
  isCurrent,
  loadPremiumTiers,
}: {
  dispatch: PremiumTierLoadDispatch;
  fallbackTiers: PremiumTier[];
  isCurrent: () => boolean;
  loadPremiumTiers: () => Promise<PremiumTier[]>;
}) => {
  try {
    const tiers = await loadPremiumTiers();
    if (isCurrent()) {
      dispatch({ tiers, type: "resolve" });
    }
  } catch {
    if (isCurrent()) {
      dispatch({ tiers: fallbackTiers, type: "resolve" });
    }
  }
};
