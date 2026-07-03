import type { PremiumTier } from "../types/premium-purchase";

export type PremiumTierLoadState = {
  tiers: PremiumTier[];
};

export type PremiumTierLoadAction = {
  tiers: PremiumTier[];
  type: "resolve";
};

export const getInitialPremiumTierLoadState = (
  tiers: PremiumTier[],
): PremiumTierLoadState => ({
  tiers,
});

export const getPremiumTierLoadResolveAction = (
  tiers: PremiumTier[],
): PremiumTierLoadAction => ({
  tiers,
  type: "resolve",
});

export const premiumTierLoadReducer = (
  state: PremiumTierLoadState,
  action: PremiumTierLoadAction,
): PremiumTierLoadState => {
  switch (action.type) {
    case "resolve":
      return {
        ...state,
        tiers: action.tiers,
      };
  }
};
