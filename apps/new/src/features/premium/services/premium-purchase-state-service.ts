import type {
  PremiumEntitlementStatus,
  PremiumPurchaseResult,
  PremiumPurchaseState,
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

export const getPremiumPurchaseSelectAction = (
  tierId: PremiumTierId,
): PremiumPurchaseAction => ({
  tierId,
  type: "select",
});

export const getPremiumPurchaseStartAction = (): PremiumPurchaseAction => ({
  type: "start",
});

export const getPremiumPurchaseSucceedAction = (
  result: PremiumPurchaseResult,
): PremiumPurchaseAction => ({
  result,
  type: "succeed",
});

export const getPremiumPurchaseSyncEntitlementAction = ({
  active,
  message,
  tierId,
}: Omit<
  Extract<PremiumPurchaseAction, { type: "sync-entitlement" }>,
  "type"
>): PremiumPurchaseAction => ({
  active,
  message,
  tierId,
  type: "sync-entitlement",
});

export const getPremiumPurchaseFailAction = (
  error: string,
): PremiumPurchaseAction => ({
  error,
  type: "fail",
});

export const getPremiumPurchaseResetAction = (): PremiumPurchaseAction => ({
  type: "reset",
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
