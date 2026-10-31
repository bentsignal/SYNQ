/**
 * SYNQ Premium in RevenueCat, as 2.5.2 set it up. Change these only with
 * the RevenueCat dashboard and App Store Connect.
 */

/** RevenueCat's public iOS SDK key (2.5.2's). */
export const REVENUECAT_IOS_KEY = "appl_qzTfhRrmSegqQhRUukTmiUsVMIq";

/** The entitlement every Premium product grants. */
export const PREMIUM_ENTITLEMENT = "Premium";

export const PLANS = ["monthly", "yearly", "lifetime"] as const;

export type Plan = (typeof PLANS)[number];

/** App Store product ids. */
export const PLAN_PRODUCTS = {
  lifetime: "SYNQPremiumLifetime",
  monthly: "SYNQPremiumMonthly",
  yearly: "SYNQPremiumYearly",
} as const satisfies Record<Plan, string>;

/** RevenueCat offerings, one per plan; each sells its first package. */
export const PLAN_OFFERINGS = {
  lifetime: "Premium Lifetime",
  monthly: "Premium Monthly",
  yearly: "Premium Yearly",
} as const satisfies Record<Plan, string>;

export const TERMS_URL = "https://directedbyshawn.com/synq-terms-conditions";
export const PRIVACY_URL = "https://directedbyshawn.com/synq-privacy-policy";
