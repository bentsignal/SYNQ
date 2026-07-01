import type {
  PremiumPurchaseResult,
  PremiumTier,
  PremiumTierId,
} from "../types/premium-purchase";

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

export async function purchasePremiumTier(
  tierId: PremiumTierId,
): Promise<PremiumPurchaseResult> {
  return Promise.reject(
    new Error(
      `Purchasing ${tierId} still needs RevenueCat entitlement integration.`,
    ),
  );
}

export async function restorePremiumPurchase(): Promise<PremiumPurchaseResult> {
  return Promise.reject(
    new Error("Restoring purchases still needs RevenueCat entitlement integration."),
  );
}
