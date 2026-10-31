import type { Href } from "expo-router";
import { router } from "expo-router";

import { isPremium, subscribePremium } from "~/features/premium/premium";

/**
 * What the player needs from Premium, in one place: whether the free
 * tier's ad applies, when that changes, and how to open the paywall.
 */
export type PremiumTier = "free" | "premium";

export function getPremiumTier() {
  return tierFor(isPremium());
}

function tierFor(premium: boolean) {
  return (premium ? "premium" : "free") satisfies PremiumTier;
}

/** Calls `listener` whenever the tier changes; returns an unsubscribe. */
export function subscribePremiumTier(listener: () => void) {
  return subscribePremium(listener);
}

const PAYWALL = "/premium";

function isHref(path: string): path is Href & string {
  return path.startsWith("/");
}

/** Opens the paywall (the ad's Learn More). */
export function openPaywall() {
  if (isHref(PAYWALL)) router.push(PAYWALL);
}
