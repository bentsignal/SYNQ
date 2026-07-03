import type {
  PremiumEntitlementStatus,
  PremiumPurchaseResult,
  PremiumTier,
  PremiumTierId,
} from "../types/premium-purchase";
import {
  getTierIdFromProduct,
  hydratePremiumTierPrices,
  premiumOfferingNames,
} from "./premium-catalog-service";

export type PremiumPurchasePackage = {
  product: {
    priceString?: string | null;
  };
};

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

const getPremiumEntitlement = (customerInfo: PremiumCustomerInfo) =>
  customerInfo.entitlements?.active?.Premium ?? null;

const getPremiumTierIdFromEntitlement = (
  entitlement: PremiumEntitlement,
): PremiumTierId => getTierIdFromProduct(entitlement.productIdentifier ?? "");

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
  const entitlement = getPremiumEntitlement(customerInfo);

  if (!entitlement) {
    throw new Error("Premium entitlement was not activated.");
  }

  return {
    active: true,
    message: "Premium is active.",
    tierId: getPremiumTierIdFromEntitlement(entitlement),
  };
}

export async function restorePremiumPurchaseWithDependencies(
  dependencies: PremiumPurchaseExecutorDependencies,
): Promise<PremiumPurchaseResult> {
  const customerInfo = await dependencies.restorePurchases();
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
}

export async function checkPremiumEntitlementWithDependencies(
  dependencies: PremiumPurchaseExecutorDependencies,
): Promise<PremiumEntitlementStatus> {
  const customerInfo = await dependencies.getCustomerInfo();
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
}
