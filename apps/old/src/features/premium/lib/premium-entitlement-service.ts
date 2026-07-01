import CFG from "@/src/constants/Config";
import {
  clearStoredPremiumExpiration,
  getStoredPremiumExpiration,
  setStoredLifetimePremiumExpiration,
  setStoredPremiumExpiration,
} from "@/src/features/premium/lib/premium-expiration-storage-service";
import { isPremiumSubscriptionProductId } from "@/src/features/premium/lib/premium-products";
import {
  connect,
  restorePurchases,
} from "@/src/features/premium/lib/purchase-service";

const lifetimePremiumExpiration = "never";

const hasActiveStoredPremiumExpiration = (expiration: string) => {
  if (expiration === lifetimePremiumExpiration) {
    return true;
  }

  return new Date(expiration) > new Date();
};

export async function syncPremiumEntitlement() {
  const expiration = await getStoredPremiumExpiration();

  if (expiration && !CFG.devTestFreeVersion) {
    if (hasActiveStoredPremiumExpiration(expiration)) {
      return true;
    }

    await clearStoredPremiumExpiration();
  }

  await connect();
  const purchase = await restorePurchases();

  if (
    purchase &&
    isPremiumSubscriptionProductId(purchase.name) &&
    !CFG.devTestFreeVersion
  ) {
    if (purchase.expiration === null || purchase.name === "SYNQPremiumLifetime") {
      await setStoredLifetimePremiumExpiration();
    } else {
      await setStoredPremiumExpiration(purchase.expiration);
    }

    return true;
  }

  await clearStoredPremiumExpiration();
  return false;
}
