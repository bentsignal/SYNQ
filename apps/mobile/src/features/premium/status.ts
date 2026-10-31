import type { LegacyPremiumCache } from "@synq/db/legacy";

import type { Plan } from "./config.ts";
import { PLAN_PRODUCTS, PLANS, PREMIUM_ENTITLEMENT } from "./config.ts";

/** Whether someone has Premium, and on which plan. */
export interface PremiumStatus {
  readonly active: boolean;
  readonly plan: Plan | null;
  /** When it ends (ms), or null for lifetime or unknown. */
  readonly expiresAt: number | null;
  readonly willRenew: boolean;
}

export const FREE: PremiumStatus = {
  active: false,
  expiresAt: null,
  plan: null,
  willRenew: false,
};

/** The parts of RevenueCat's `CustomerInfo` that decide Premium. */
export interface CustomerInfoLike {
  readonly entitlements: {
    readonly active: Readonly<
      Record<
        string,
        | {
            readonly isActive: boolean;
            readonly productIdentifier: string;
            readonly expirationDateMillis: number | null;
            readonly willRenew: boolean;
          }
        | undefined
      >
    >;
  };
  readonly activeSubscriptions: readonly string[];
  readonly allPurchasedProductIdentifiers: readonly string[];
  readonly allExpirationDates: Readonly<Record<string, string | null>>;
  readonly nonSubscriptionTransactions: readonly {
    readonly productIdentifier: string;
  }[];
}

export function planForProduct(productId: string) {
  return PLANS.find((plan) => PLAN_PRODUCTS[plan] === productId) ?? null;
}

/**
 * Premium from RevenueCat. The `Premium` entitlement decides first. So no
 * one who paid loses Premium, any SYNQ product also counts the way 2.5.2
 * checked it: an active subscription, a purchase with no expiration (the
 * lifetime purchase), or one that expires in the future.
 */
export function premiumFromCustomerInfo(
  info: CustomerInfoLike,
  now: number,
): PremiumStatus {
  const entitlement = info.entitlements.active[PREMIUM_ENTITLEMENT];
  if (entitlement?.isActive === true) {
    const plan = planForProduct(entitlement.productIdentifier);
    return {
      active: true,
      expiresAt: plan === "lifetime" ? null : entitlement.expirationDateMillis,
      plan,
      willRenew: plan !== "lifetime" && entitlement.willRenew,
    };
  }
  // Lifetime first, so someone with both shows the better plan.
  for (const plan of [...PLANS].reverse()) {
    const product = PLAN_PRODUCTS[plan];
    const purchased =
      info.allPurchasedProductIdentifiers.includes(product) ||
      info.nonSubscriptionTransactions.some(
        (transaction) => transaction.productIdentifier === product,
      );
    if (!purchased && !info.activeSubscriptions.includes(product)) continue;
    const expiration = info.allExpirationDates[product] ?? null;
    const expiresAt = expiration === null ? null : Date.parse(expiration);
    if (
      info.activeSubscriptions.includes(product) ||
      expiresAt === null ||
      Number.isNaN(expiresAt) ||
      expiresAt > now
    ) {
      return {
        active: true,
        expiresAt: expiresAt !== null && Number.isFinite(expiresAt) ? expiresAt : null,
        plan,
        willRenew: info.activeSubscriptions.includes(product),
      };
    }
  }
  return FREE;
}

/**
 * Premium from 2.5.2's cached expiration, a hint until RevenueCat answers
 * (offline, or the first seconds of the first launch).
 */
export function premiumFromLegacyCache(
  cache: LegacyPremiumCache | null,
  now: number,
): PremiumStatus {
  if (cache === null) return FREE;
  if (cache.kind === "lifetime") {
    return { active: true, expiresAt: null, plan: "lifetime", willRenew: false };
  }
  return cache.expiresAt > now
    ? { active: true, expiresAt: cache.expiresAt, plan: null, willRenew: false }
    : FREE;
}

/** A stored status checked field by field (it comes from the kv-store). */
export function premiumFromStored(stored: unknown): PremiumStatus {
  if (typeof stored !== "object" || stored === null) return FREE;
  const active = Reflect.get(stored, "active");
  const plan: unknown = Reflect.get(stored, "plan");
  const expiresAt: unknown = Reflect.get(stored, "expiresAt");
  const willRenew = Reflect.get(stored, "willRenew");
  return {
    active: active === true,
    expiresAt: typeof expiresAt === "number" ? expiresAt : null,
    plan: PLANS.find((known) => known === plan) ?? null,
    willRenew: willRenew === true,
  };
}

/**
 * The status to show before RevenueCat answers: the last one it gave,
 * expired subscriptions aside.
 */
export function cachedPremium(status: PremiumStatus, now: number) {
  return status.active &&
    status.expiresAt !== null &&
    status.expiresAt <= now &&
    !status.willRenew
    ? FREE
    : status;
}
