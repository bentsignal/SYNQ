import type {
  PremiumEntitlementStatus,
  PremiumPurchaseResult,
  PremiumPurchaseState,
  PremiumTier,
  PremiumTierId,
} from "../types/premium-purchase";

export type PremiumPurchaseAction =
  | { tierId: PremiumTierId; type: "select" }
  | { type: "start" }
  | { result: PremiumPurchaseResult; type: "succeed" }
  | {
      active: boolean;
      message: string | null;
      tierId: PremiumTierId;
      type: "sync-entitlement";
    }
  | { error: string; type: "fail" }
  | { type: "reset" };

export type PremiumTierLoadState = {
  tiers: PremiumTier[];
};

export type PremiumTierLoadAction = {
  tiers: PremiumTier[];
  type: "resolve";
};

export const getInitialPremiumPurchaseState = ({
  active = false,
  tierId = "monthly",
}: Partial<Pick<PremiumEntitlementStatus, "active" | "tierId">> = {}): PremiumPurchaseState => ({
  active,
  error: null,
  message: null,
  phase: "idle",
  selectedTierId: tierId,
});

export const premiumPurchaseReducer = (
  state: PremiumPurchaseState,
  action: PremiumPurchaseAction,
): PremiumPurchaseState => {
  switch (action.type) {
    case "select":
      return {
        ...state,
        error: null,
        message: null,
        selectedTierId: action.tierId,
      };
    case "start":
      return {
        ...state,
        error: null,
        message: null,
        phase: "loading",
      };
    case "succeed":
      return {
        ...state,
        active: action.result.active,
        error: null,
        message: action.result.message,
        phase: "success",
        selectedTierId: action.result.tierId,
      };
    case "sync-entitlement":
      return {
        ...state,
        active: action.active,
        message: state.phase === "idle" ? action.message : state.message,
        selectedTierId: action.tierId,
      };
    case "fail":
      return {
        ...state,
        error: action.error,
        message: null,
        phase: "failure",
      };
    case "reset":
      return getInitialPremiumPurchaseState();
  }
};

export const getInitialPremiumTierLoadState = (
  tiers: PremiumTier[],
): PremiumTierLoadState => ({
  tiers,
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
