import type { PurchasesPackage } from "react-native-purchases";
import Purchases from "react-native-purchases";
import { premiumTiers } from "./premium-catalog-service";
import {
  checkPremiumEntitlementWithDependencies,
  loadPremiumTiersWithDependencies,
  purchasePremiumTierWithDependencies,
  restorePremiumPurchaseWithDependencies,
  type PremiumPurchaseExecutorDependencies,
  type PremiumPurchasePackage,
} from "./premium-purchase-executor-service";
import type {
  PremiumEntitlementStatus,
  PremiumPurchaseResult,
  PremiumTier,
  PremiumTierId,
} from "../types/premium-purchase";

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

const premiumPurchaseDependencies: PremiumPurchaseExecutorDependencies = {
  getCustomerInfo: async () => {
    configureRevenueCat();
    return Purchases.getCustomerInfo();
  },
  getOfferings: async () => {
    configureRevenueCat();
    return Purchases.getOfferings();
  },
  purchasePackage: async (purchasePackage: PremiumPurchasePackage) =>
    Purchases.purchasePackage(purchasePackage as PurchasesPackage),
  restorePurchases: async () => {
    configureRevenueCat();
    return Purchases.restorePurchases();
  },
};

export async function loadPremiumTiers(): Promise<PremiumTier[]> {
  configureRevenueCat();
  return loadPremiumTiersWithDependencies(premiumPurchaseDependencies);
}

export async function purchasePremiumTier(
  tierId: PremiumTierId,
): Promise<PremiumPurchaseResult> {
  return purchasePremiumTierWithDependencies(
    tierId,
    premiumPurchaseDependencies,
  );
}

export async function restorePremiumPurchase(): Promise<PremiumPurchaseResult> {
  return restorePremiumPurchaseWithDependencies(premiumPurchaseDependencies);
}

export async function checkPremiumEntitlement(): Promise<PremiumEntitlementStatus> {
  return checkPremiumEntitlementWithDependencies(premiumPurchaseDependencies);
}
