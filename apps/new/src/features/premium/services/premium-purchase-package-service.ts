import type { PremiumTierId } from "../types/premium-purchase";
import { premiumOfferingNames } from "./premium-catalog-service";

export type PremiumPurchasePackage = {
  product: {
    priceString?: string | null;
  };
};

export type PremiumOfferingsByName = Partial<
  Record<
    string,
    {
      availablePackages: PremiumPurchasePackage[];
    }
  >
>;

export type PremiumOfferingsResult = {
  all: PremiumOfferingsByName;
};

export const getPremiumPackageForTier = (
  tierId: PremiumTierId,
  offerings: PremiumOfferingsResult,
) => {
  const premiumOffering = offerings.all[premiumOfferingNames[tierId]];
  const purchasePackage = premiumOffering?.availablePackages[0];

  if (!purchasePackage) {
    throw new Error(`${premiumOfferingNames[tierId]} is unavailable.`);
  }

  return purchasePackage;
};

export const getPremiumPriceString = (
  offerings: PremiumOfferingsResult,
  tierId: PremiumTierId,
) =>
  offerings.all[premiumOfferingNames[tierId]]?.availablePackages[0]?.product
    .priceString ?? undefined;
