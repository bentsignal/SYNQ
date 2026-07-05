import type {
  PremiumPurchaseResult,
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
