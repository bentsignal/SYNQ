import assert from "node:assert/strict";
import { test } from "node:test";

import type { CustomerInfoLike } from "./status.ts";
import {
  cachedPremium,
  FREE,
  premiumFromCustomerInfo,
  premiumFromLegacyCache,
  premiumFromStored,
} from "./status.ts";

const NOW = Date.parse("2026-10-31T12:00:00Z");
const DAY = 86_400_000;

const NOTHING: CustomerInfoLike = {
  activeSubscriptions: [],
  allExpirationDates: {},
  allPurchasedProductIdentifiers: [],
  entitlements: { active: {} },
  nonSubscriptionTransactions: [],
};

void test("a fresh customer is free", () => {
  assert.deepEqual(premiumFromCustomerInfo(NOTHING, NOW), FREE);
});

void test("the Premium entitlement decides, with its plan and renewal", () => {
  const status = premiumFromCustomerInfo(
    {
      ...NOTHING,
      entitlements: {
        active: {
          Premium: {
            expirationDateMillis: NOW + 30 * DAY,
            isActive: true,
            productIdentifier: "SYNQPremiumYearly",
            willRenew: true,
          },
        },
      },
    },
    NOW,
  );
  assert.deepEqual(status, {
    active: true,
    expiresAt: NOW + 30 * DAY,
    plan: "yearly",
    willRenew: true,
  });
});

void test("a lifetime purchase counts without the entitlement, like 2.5.2", () => {
  const status = premiumFromCustomerInfo(
    {
      ...NOTHING,
      allExpirationDates: { SYNQPremiumLifetime: null },
      allPurchasedProductIdentifiers: ["SYNQPremiumLifetime"],
    },
    NOW,
  );
  assert.equal(status.active, true);
  assert.equal(status.plan, "lifetime");
  assert.equal(status.expiresAt, null);
});

void test("a lifetime transaction alone counts", () => {
  const status = premiumFromCustomerInfo(
    {
      ...NOTHING,
      nonSubscriptionTransactions: [{ productIdentifier: "SYNQPremiumLifetime" }],
    },
    NOW,
  );
  assert.equal(status.plan, "lifetime");
});

void test("a subscription counts until it expires", () => {
  const info = (expires: number): CustomerInfoLike => ({
    ...NOTHING,
    allExpirationDates: { SYNQPremiumMonthly: new Date(expires).toISOString() },
    allPurchasedProductIdentifiers: ["SYNQPremiumMonthly"],
  });
  assert.equal(premiumFromCustomerInfo(info(NOW + DAY), NOW).active, true);
  assert.equal(premiumFromCustomerInfo(info(NOW - DAY), NOW).active, false);
});

void test("other apps' products don't count", () => {
  const status = premiumFromCustomerInfo(
    {
      ...NOTHING,
      activeSubscriptions: ["SomethingElse"],
      allPurchasedProductIdentifiers: ["SomethingElse"],
    },
    NOW,
  );
  assert.equal(status.active, false);
});

void test("2.5.2's cached expiration is a hint until RevenueCat answers", () => {
  assert.equal(premiumFromLegacyCache({ kind: "lifetime" }, NOW).plan, "lifetime");
  assert.equal(
    premiumFromLegacyCache({ expiresAt: NOW + DAY, kind: "until" }, NOW).active,
    true,
  );
  assert.equal(
    premiumFromLegacyCache({ expiresAt: NOW - DAY, kind: "until" }, NOW).active,
    false,
  );
  assert.equal(premiumFromLegacyCache(null, NOW).active, false);
});

void test("the stored status survives junk and lapses with its expiration", () => {
  assert.deepEqual(premiumFromStored("nope"), FREE);
  const stored = premiumFromStored({
    active: true,
    expiresAt: NOW - DAY,
    plan: "monthly",
    willRenew: false,
  });
  assert.equal(stored.plan, "monthly");
  assert.deepEqual(cachedPremium(stored, NOW), FREE);
  assert.equal(cachedPremium({ ...stored, willRenew: true }, NOW).active, true);
});
