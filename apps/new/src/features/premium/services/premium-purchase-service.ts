import type {
  PremiumPurchaseResult,
  PremiumTier,
  PremiumTierId,
} from "../types/premium-purchase";
import Purchases from "react-native-purchases";

const publicRevenueCatKey = "appl_qzTfhRrmSegqQhRUukTmiUsVMIq";

const offeringNames = {
  lifetime: "Premium Lifetime",
  monthly: "Premium Monthly",
  yearly: "Premium Yearly",
} satisfies Record<PremiumTierId, string>;

const productTierIds = {
  SYNQPremiumLifetime: "lifetime",
  SYNQPremiumMonthly: "monthly",
  SYNQPremiumYearly: "yearly",
} satisfies Record<string, PremiumTierId>;
const productTierIdLookup: Record<string, PremiumTierId> = productTierIds;

let isConfigured = false;

export const premiumTiers: PremiumTier[] = [
  {
    description: "Full access with monthly renewal.",
    id: "monthly",
    label: "Monthly",
    price: "$∞",
  },
  {
    description: "Full access with yearly renewal.",
    id: "yearly",
    label: "Yearly",
    price: "$∞",
  },
  {
    description: "Full access with one lifetime purchase.",
    id: "lifetime",
    label: "Lifetime",
    price: "$∞",
  },
];

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

const getTierIdFromProduct = (productIdentifier: string): PremiumTierId => {
  return productTierIdLookup[productIdentifier] ?? "monthly";
};

const getPackageForTier = async (tierId: PremiumTierId) => {
  configureRevenueCat();
  const offerings = await Purchases.getOfferings();
  const premiumOffering = offerings.all[offeringNames[tierId]];
  const purchasePackage = premiumOffering?.availablePackages[0];

  if (!purchasePackage) {
    throw new Error(`${offeringNames[tierId]} is unavailable.`);
  }

  return purchasePackage;
};

export async function loadPremiumTiers(): Promise<PremiumTier[]> {
  configureRevenueCat();
  const offerings = await Purchases.getOfferings();

  return premiumTiers.map((tier) => {
    const purchasePackage =
      offerings.all[offeringNames[tier.id]]?.availablePackages[0];

    return {
      ...tier,
      price: purchasePackage?.product.priceString ?? tier.price,
    };
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
