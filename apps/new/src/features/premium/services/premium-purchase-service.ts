import type {
  PremiumEntitlementStatus,
  PremiumPurchaseResult,
  PremiumTier,
  PremiumTierId,
} from "../types/premium-purchase";
import Purchases from "react-native-purchases";
import {
  getTierIdFromProduct,
  hydratePremiumTierPrices,
  premiumOfferingNames,
  premiumTiers,
} from "./premium-catalog-service";

const publicRevenueCatKey = "appl_qzTfhRrmSegqQhRUukTmiUsVMIq";

let isConfigured = false;

export { premiumTiers };

const configureRevenueCat = () => {
  if (isConfigured) {
    return;
  }

  Purchases.configure({
    apiKey: publicRevenueCatKey,
    appUserID: null,
  });
  isConfigured = true;
};

const getPackageForTier = async (tierId: PremiumTierId) => {
  configureRevenueCat();
  const offerings = await Purchases.getOfferings();
  const premiumOffering = offerings.all[premiumOfferingNames[tierId]];
  const purchasePackage = premiumOffering?.availablePackages[0];

  if (!purchasePackage) {
    throw new Error(`${premiumOfferingNames[tierId]} is unavailable.`);
  }

  return purchasePackage;
};

export async function loadPremiumTiers(): Promise<PremiumTier[]> {
  configureRevenueCat();
  const offerings = await Purchases.getOfferings();

  return hydratePremiumTierPrices({
    lifetime:
      offerings.all[premiumOfferingNames.lifetime]?.availablePackages[0]
        ?.product.priceString,
    monthly:
      offerings.all[premiumOfferingNames.monthly]?.availablePackages[0]?.product
        .priceString,
    yearly:
      offerings.all[premiumOfferingNames.yearly]?.availablePackages[0]?.product
        .priceString,
  });
}

export async function purchasePremiumTier(
  tierId: PremiumTierId,
): Promise<PremiumPurchaseResult> {
  const purchasePackage = await getPackageForTier(tierId);
  const { customerInfo } = await Purchases.purchasePackage(purchasePackage);
  const entitlement = customerInfo.entitlements.active.Premium;

  if (!entitlement) {
    throw new Error("Premium entitlement was not activated.");
  }

  return {
    active: true,
    message: "Premium is active.",
    tierId: getTierIdFromProduct(entitlement.productIdentifier),
  };
}

export async function restorePremiumPurchase(): Promise<PremiumPurchaseResult> {
  configureRevenueCat();
  const customerInfo = await Purchases.restorePurchases();
  const entitlement = customerInfo.entitlements.active.Premium;

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
    tierId: getTierIdFromProduct(entitlement.productIdentifier),
  };
}

export async function checkPremiumEntitlement(): Promise<PremiumEntitlementStatus> {
  configureRevenueCat();
  const customerInfo = await Purchases.getCustomerInfo();
  const entitlement = customerInfo.entitlements.active.Premium;

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
    tierId: getTierIdFromProduct(entitlement.productIdentifier),
  };
}
