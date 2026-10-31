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

export const FREE = Object.freeze({
  active: false,
  expiresAt: null,
  plan: null,
  willRenew: false,
} satisfies PremiumStatus);

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

function fromEntitlement(info: CustomerInfoLike) {
  const entitlement = info.entitlements.active[PREMIUM_ENTITLEMENT];
  if (entitlement?.isActive !== true) return null;
  const plan = planForProduct(entitlement.productIdentifier);
  const lifetime = plan === "lifetime";
  return {
    active: true,
    expiresAt: lifetime ? null : entitlement.expirationDateMillis,
    plan,
    willRenew: !lifetime && entitlement.willRenew,
  } satisfies PremiumStatus;
}

function purchased(info: CustomerInfoLike, product: string) {
  return (
    info.allPurchasedProductIdentifiers.includes(product) ||
    info.activeSubscriptions.includes(product) ||
    info.nonSubscriptionTransactions.some(
      (transaction) => transaction.productIdentifier === product,
    )
  );
}

/** A plan's product, counted the way 2.5.2 did. */
function fromProduct(info: CustomerInfoLike, plan: Plan, now: number) {
  const product = PLAN_PRODUCTS[plan];
  if (!purchased(info, product)) return null;
  const subscribed = info.activeSubscriptions.includes(product);
  const expiration = info.allExpirationDates[product] ?? null;
  const parsed = expiration === null ? Number.NaN : Date.parse(expiration);
  const expiresAt = Number.isFinite(parsed) ? parsed : null;
  if (!subscribed && expiresAt !== null && expiresAt <= now) return null;
  return {
    active: true,
    expiresAt,
    plan,
    willRenew: subscribed,
  } satisfies PremiumStatus;
}

/**
 * Premium from RevenueCat. The `Premium` entitlement decides first. So no
 * one who paid loses Premium, any SYNQ product also counts the way 2.5.2
 * checked it: an active subscription, a purchase with no expiration (the
 * lifetime purchase), or one that expires in the future. Lifetime is
 * checked first, so someone with both shows the better plan.
 */
export function premiumFromCustomerInfo(info: CustomerInfoLike, now: number) {
  return (
    fromEntitlement(info) ??
    [...PLANS]
      .reverse()
      .map((plan) => fromProduct(info, plan, now))
      .find((status) => status !== null) ??
    FREE
  );
}

/**
 * Premium from 2.5.2's cached expiration, a hint until RevenueCat answers
 * (offline, or the first seconds of the first launch).
 */
export function premiumFromLegacyCache(
  cache: LegacyPremiumCache | null,
  now: number,
) {
  if (cache === null) return FREE;
  if (cache.kind === "lifetime") {
    return {
      active: true,
      expiresAt: null,
      plan: "lifetime",
      willRenew: false,
    } satisfies PremiumStatus;
  }
  if (cache.expiresAt <= now) return FREE;
  return {
    active: true,
    expiresAt: cache.expiresAt,
    plan: null,
    willRenew: false,
  } satisfies PremiumStatus;
}

function numberOrNull(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function planOrNull(value: unknown) {
  return PLANS.find((plan) => plan === value) ?? null;
}

/** A stored status checked field by field (it comes from the kv-store). */
export function premiumFromStored(stored: unknown) {
  if (typeof stored !== "object" || stored === null) return FREE;
  return {
    active: Reflect.get(stored, "active") === true,
    expiresAt: numberOrNull(Reflect.get(stored, "expiresAt")),
    plan: planOrNull(Reflect.get(stored, "plan")),
    willRenew: Reflect.get(stored, "willRenew") === true,
  } satisfies PremiumStatus;
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
