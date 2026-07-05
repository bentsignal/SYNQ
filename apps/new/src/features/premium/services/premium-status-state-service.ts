import type { PremiumPurchaseState } from "../types/premium-purchase";

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
