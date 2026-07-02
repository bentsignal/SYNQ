import { useEffect } from "react";
import {
  loadPremiumTiers,
  premiumTiers,
} from "../services/premium-purchase-service";
import type { PremiumTierLoadAction } from "../services/premium-purchase-state-service";

type UsePremiumTierLoaderParams = {
  dispatchTierState: React.Dispatch<PremiumTierLoadAction>;
};

export function usePremiumTierLoader({
  dispatchTierState,
}: UsePremiumTierLoaderParams) {
  useEffect(() => {
    let isMounted = true;

    const loadTiers = async () => {
      try {
        const nextTiers = await loadPremiumTiers();
        if (isMounted) {
          dispatchTierState({
            tiers: nextTiers,
            type: "resolve",
          });
        }
      } catch {
        if (isMounted) {
          dispatchTierState({
            tiers: premiumTiers,
            type: "resolve",
          });
        }
      }
    };

    void loadTiers();

    return () => {
      isMounted = false;
    };
  }, [dispatchTierState]);
}
