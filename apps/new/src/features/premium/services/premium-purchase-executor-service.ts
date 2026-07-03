import type {
  PremiumEntitlementStatus,
  PremiumPurchaseResult,
  PremiumTier,
  PremiumTierId,
} from "../types/premium-purchase";
import {
  hydratePremiumTierPrices,
  premiumOfferingNames,
} from "./premium-catalog-service";
import {
  getPremiumEntitlementStatusResult,
  getPremiumPurchaseActivationResult,
  getPremiumRestoreResult,
  type PremiumCustomerInfo,
} from "./premium-entitlement-result-service";

export type { PremiumCustomerInfo } from "./premium-entitlement-result-service";

export type PremiumPurchasePackage = {
  product: {
    priceString?: string | null;
  };
};

export type PremiumPurchaseExecutorDependencies = {
  getOfferings: () => Promise<{
    all: Partial<
      Record<
        string,
        {
          availablePackages: PremiumPurchasePackage[];
        }
      >
    >;
  }>;
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
  const premiumOffering = offerings.all[premiumOfferingNames[tierId]];
  const purchasePackage = premiumOffering?.availablePackages[0];

  if (!purchasePackage) {
    throw new Error(`${premiumOfferingNames[tierId]} is unavailable.`);
  }

  return purchasePackage;
};

export async function loadPremiumTiersWithDependencies(
  dependencies: PremiumPurchaseExecutorDependencies,
): Promise<PremiumTier[]> {
  const offerings = await dependencies.getOfferings();

  return hydratePremiumTierPrices({
    lifetime:
      offerings.all[premiumOfferingNames.lifetime]?.availablePackages[0]
        ?.product.priceString ?? undefined,
    monthly:
      offerings.all[premiumOfferingNames.monthly]?.availablePackages[0]?.product
        .priceString ?? undefined,
    yearly:
      offerings.all[premiumOfferingNames.yearly]?.availablePackages[0]?.product
        .priceString ?? undefined,
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
