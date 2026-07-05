import type {
  PremiumEntitlementStatus,
  PremiumPurchaseState,
} from "../types/premium-purchase";
import type { PremiumPurchaseAction } from "./premium-purchase-action-service";

export {
  getInitialPremiumTierLoadState,
  getPremiumTierLoadResolveAction,
  premiumTierLoadReducer,
  type PremiumTierLoadAction,
  type PremiumTierLoadState,
} from "./premium-tier-load-state-service";

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

export {
  getPremiumPurchaseFailAction,
  getPremiumPurchaseResetAction,
  getPremiumPurchaseSelectAction,
  getPremiumPurchaseStartAction,
  getPremiumPurchaseSucceedAction,
  getPremiumPurchaseSyncEntitlementAction,
  type PremiumPurchaseAction,
} from "./premium-purchase-action-service";
