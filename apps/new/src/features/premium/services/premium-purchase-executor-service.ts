import type {
  PremiumEntitlementStatus,
  PremiumPurchaseResult,
  PremiumTier,
  PremiumTierId,
} from "../types/premium-purchase";
import {
  hydratePremiumTierPrices,
} from "./premium-catalog-service";
import {
  getPremiumEntitlementStatusResult,
  getPremiumPurchaseActivationResult,
  getPremiumRestoreResult,
  type PremiumCustomerInfo,
} from "./premium-entitlement-result-service";
import {
  getPremiumPackageForTier,
  getPremiumPriceString,
  type PremiumOfferingsResult,
  type PremiumPurchasePackage,
} from "./premium-purchase-package-service";

export type { PremiumCustomerInfo } from "./premium-entitlement-result-service";
export type {
  PremiumOfferingsResult,
  PremiumPurchasePackage,
} from "./premium-purchase-package-service";

export type PremiumPurchaseExecutorDependencies = {
  getOfferings: () => Promise<PremiumOfferingsResult>;
  getCustomerInfo: () => Promise<PremiumCustomerInfo>;
  purchasePackage: (
    purchasePackage: PremiumPurchasePackage,
  ) => Promise<{ customerInfo: PremiumCustomerInfo }>;
  restorePurchases: () => Promise<PremiumCustomerInfo>;
};

const getPackageForTierWithDependencies = async (
  tierId: PremiumTierId,
  dependencies: PremiumPurchaseExecutorDependencies,
) => {
  const offerings = await dependencies.getOfferings();
  return getPremiumPackageForTier(tierId, offerings);
};

export async function loadPremiumTiersWithDependencies(
  dependencies: PremiumPurchaseExecutorDependencies,
): Promise<PremiumTier[]> {
  const offerings = await dependencies.getOfferings();

  return hydratePremiumTierPrices({
    lifetime: getPremiumPriceString(offerings, "lifetime"),
    monthly: getPremiumPriceString(offerings, "monthly"),
    yearly: getPremiumPriceString(offerings, "yearly"),
  });
}

export async function purchasePremiumTierWithDependencies(
  tierId: PremiumTierId,
  dependencies: PremiumPurchaseExecutorDependencies,
): Promise<PremiumPurchaseResult> {
  const purchasePackage = await getPackageForTierWithDependencies(
    tierId,
    dependencies,
  );
  const { customerInfo } = await dependencies.purchasePackage(purchasePackage);
  return getPremiumPurchaseActivationResult(customerInfo);
}

export async function restorePremiumPurchaseWithDependencies(
  dependencies: PremiumPurchaseExecutorDependencies,
): Promise<PremiumPurchaseResult> {
  const customerInfo = await dependencies.restorePurchases();
  return getPremiumRestoreResult(customerInfo);
}

export async function checkPremiumEntitlementWithDependencies(
  dependencies: PremiumPurchaseExecutorDependencies,
): Promise<PremiumEntitlementStatus> {
  const customerInfo = await dependencies.getCustomerInfo();
  return getPremiumEntitlementStatusResult(customerInfo);
}
