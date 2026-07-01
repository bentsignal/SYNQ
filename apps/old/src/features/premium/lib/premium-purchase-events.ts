import { posthog } from "@/src/lib/posthog";

export const capturePremiumPurchaseAttempt = (tier: string) => {
  posthog.capture("attempt_purchase_premium", {
    tier,
  });
};

export const capturePremiumOptionPress = (tier: string, price: string) => {
  posthog.capture("premium_option_press", {
    price,
    tier,
  });
};

export const capturePremiumPurchaseSuccess = (tier: string) => {
  posthog.capture("success_purchase_premium", {
    tier,
  });
};

export const isPremiumPurchaseCancelled = (trace: string) => {
  return trace.includes("cancelled");
};

export const capturePremiumPurchaseError = (trace: string) => {
  const cancelled = isPremiumPurchaseCancelled(trace);

  posthog.capture("error_purchase_premium", {
    cancelled,
    error: trace,
  });

  return { cancelled };
};
