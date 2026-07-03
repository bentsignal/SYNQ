import type {
  PremiumEntitlementStatus,
  PremiumTierId,
} from "../types/premium-purchase";

export type PremiumEntitlementPhase = "checking" | "failure" | "ready";

export type PremiumEntitlementState = {
  active: boolean;
  error: string | null;
  message: string | null;
  phase: PremiumEntitlementPhase;
  tierId: PremiumTierId;
};

export type PremiumEntitlementAction =
  | { type: "checking" }
  | { error: string; type: "fail" }
  | { status: PremiumEntitlementStatus; type: "succeed" };

export const initialPremiumEntitlementState: PremiumEntitlementState = {
  active: false,
  error: null,
  message: null,
  phase: "checking",
  tierId: "monthly",
};

export const getPremiumEntitlementCheckingAction =
  (): PremiumEntitlementAction => ({
    type: "checking",
  });

export const getPremiumEntitlementSucceedAction = (
  status: PremiumEntitlementStatus,
): PremiumEntitlementAction => ({
  status,
  type: "succeed",
});

export const getPremiumEntitlementFailAction = (
  error: string,
): PremiumEntitlementAction => ({
  error,
  type: "fail",
});

export const premiumEntitlementReducer = (
  state: PremiumEntitlementState,
  action: PremiumEntitlementAction,
): PremiumEntitlementState => {
  switch (action.type) {
    case "checking":
      return {
        ...state,
        error: null,
        phase: "checking",
      };
    case "fail":
      return {
        ...state,
        error: action.error,
        phase: "failure",
      };
    case "succeed":
      return {
        active: action.status.active,
        error: null,
        message: action.status.message,
        phase: "ready",
        tierId: action.status.tierId,
      };
  }
};
