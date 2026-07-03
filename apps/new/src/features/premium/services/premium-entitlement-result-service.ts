import type {
  PremiumEntitlementStatus,
  PremiumPurchaseResult,
  PremiumTierId,
} from "../types/premium-purchase";
import { getTierIdFromProduct } from "./premium-catalog-service";

type PremiumEntitlement = {
  productIdentifier?: string | null;
};

export type PremiumCustomerInfo = {
  entitlements?: {
    active?: {
      Premium?: PremiumEntitlement | null;
    };
  };
};

const getPremiumEntitlement = (customerInfo: PremiumCustomerInfo) =>
  customerInfo.entitlements?.active?.Premium ?? null;

const getPremiumTierIdFromEntitlement = (
  entitlement: PremiumEntitlement,
): PremiumTierId => getTierIdFromProduct(entitlement.productIdentifier ?? "");

export const getPremiumPurchaseActivationResult = (
  customerInfo: PremiumCustomerInfo,
): PremiumPurchaseResult => {
  const entitlement = getPremiumEntitlement(customerInfo);

  if (!entitlement) {
    throw new Error("Premium entitlement was not activated.");
  }

  return {
    active: true,
    message: "Premium is active.",
    tierId: getPremiumTierIdFromEntitlement(entitlement),
  };
};

export const getPremiumRestoreResult = (
  customerInfo: PremiumCustomerInfo,
): PremiumPurchaseResult => {
  const entitlement = getPremiumEntitlement(customerInfo);

  if (!entitlement) {
    return {
      active: false,
      message: "No active premium purchase was found.",
      tierId: "monthly",
    };
  }

  return {
    active: true,
    message: "Premium purchase restored.",
    tierId: getPremiumTierIdFromEntitlement(entitlement),
  };
};

export const getPremiumEntitlementStatusResult = (
  customerInfo: PremiumCustomerInfo,
): PremiumEntitlementStatus => {
  const entitlement = getPremiumEntitlement(customerInfo);

  if (!entitlement) {
    return {
      active: false,
      message: "Premium is inactive.",
      tierId: "monthly",
    };
  }

  return {
    active: true,
    message: "Premium is active.",
    tierId: getPremiumTierIdFromEntitlement(entitlement),
  };
};
