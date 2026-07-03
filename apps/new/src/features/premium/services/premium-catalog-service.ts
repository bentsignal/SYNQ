import type {
  PremiumTier,
  PremiumTierId,
} from "../types/premium-purchase";

export const premiumOfferingNames = {
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

export const getTierIdFromProduct = (
  productIdentifier: string,
): PremiumTierId => productTierIdLookup[productIdentifier] ?? "monthly";

export const hydratePremiumTierPrices = (
  prices: Partial<Record<PremiumTierId, string>>,
) =>
  premiumTiers.map((tier) => ({
    ...tier,
    price: prices[tier.id] ?? tier.price,
  }));
