import type {
  PurchasesIntroPrice,
  PurchasesPackage,
} from "react-native-purchases";
import Purchases, {
  INTRO_ELIGIBILITY_STATUS,
  PURCHASES_ERROR_CODE,
} from "react-native-purchases";

import type { Plan } from "./config";
import { track } from "~/features/analytics/analytics";
import { PLAN_OFFERINGS, PLANS } from "./config";
import { applyCustomerInfo } from "./premium";

/** One plan on the paywall, priced by the App Store. */
export interface PaywallPlan {
  plan: Plan;
  package: PurchasesPackage;
  /** "$2.99". */
  price: string;
  /** A free trial or intro price this person can still use. */
  intro: PurchasesIntroPrice | null;
}

const UNITS: Record<string, string> = {
  DAY: "Day",
  MONTH: "Month",
  WEEK: "Week",
  YEAR: "Year",
};

/** "1 Month", "3 Months", "1 Week". */
export function introPeriod(intro: PurchasesIntroPrice) {
  const count = intro.periodNumberOfUnits * Math.max(1, intro.cycles);
  const unit = UNITS[intro.periodUnit] ?? "Month";
  return `${String(count)} ${unit}${count === 1 ? "" : "s"}`;
}

/** The plans for sale, from each offering's first package, in plan order. */
export async function loadPaywallPlans() {
  const offerings = await Purchases.getOfferings();
  const packages = PLANS.flatMap((plan) => {
    const offered = offerings.all[PLAN_OFFERINGS[plan]]?.availablePackages[0];
    return offered === undefined ? [] : [{ offered, plan }];
  });
  if (packages.length === 0) throw new Error("No plans are for sale.");
  const subscriptions = packages
    .filter(({ plan }) => plan !== "lifetime")
    .map(({ offered }) => offered.product.identifier);
  // Eligibility needs the App Store; without it, no trial is promised.
  const eligibility = await Purchases.checkTrialOrIntroductoryPriceEligibility(
    subscriptions,
  ).catch(() => null);
  return packages.map(({ offered, plan }): PaywallPlan => {
    const eligible =
      eligibility?.[offered.product.identifier]?.status ===
      INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_ELIGIBLE;
    return {
      intro: eligible ? offered.product.introPrice : null,
      package: offered,
      plan,
      price: offered.product.priceString,
    };
  });
}

function isCancelled(error: unknown) {
  if (typeof error !== "object" || error === null) return false;
  const code: unknown = Reflect.get(error, "code");
  return (
    Reflect.get(error, "userCancelled") === true ||
    code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR
  );
}

function message(error: unknown) {
  return error instanceof Error
    ? error.message
    : typeof error === "object" && error !== null && "message" in error
      ? String(error.message)
      : String(error);
}

/**
 * Buys a plan. Resolves to "purchased" or "cancelled"; rejects when the
 * App Store fails. Sends 2.5.2's purchase events.
 */
export async function purchasePlan(choice: PaywallPlan) {
  const tier = PLAN_OFFERINGS[choice.plan];
  track("attempt_purchase_premium", { tier });
  try {
    const { customerInfo } = await Purchases.purchasePackage(choice.package);
    applyCustomerInfo(customerInfo);
    track("success_purchase_premium", { tier });
    return "purchased" as const;
  } catch (error) {
    const cancelled = isCancelled(error);
    track("error_purchase_premium", { cancelled, error: message(error) });
    if (cancelled) return "cancelled" as const;
    throw error;
  }
}

/** Restore Purchases: asks the App Store again. True when Premium is active. */
export async function restorePremium() {
  const info = await Purchases.restorePurchases();
  return applyCustomerInfo(info).active;
}

/** The store page where a subscription is managed, if there is one. */
export async function managementUrl() {
  const info = await Purchases.getCustomerInfo();
  return info.managementURL;
}
