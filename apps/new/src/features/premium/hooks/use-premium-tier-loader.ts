import { useEffect } from "react";
import {
  loadPremiumTiers,
  premiumTiers,
} from "../services/premium-purchase-service";
import type { PremiumTierLoadAction } from "../services/premium-purchase-state-service";
import { runPremiumTierLoadCommand } from "../services/premium-tier-load-command-flow-service";

type UsePremiumTierLoaderParams = {
  dispatchTierState: React.Dispatch<PremiumTierLoadAction>;
};

export function usePremiumTierLoader({
  dispatchTierState,
}: UsePremiumTierLoaderParams) {
  useEffect(() => {
    let isMounted = true;

    void runPremiumTierLoadCommand({
      dispatch: dispatchTierState,
      fallbackTiers: premiumTiers,
      isCurrent: () => isMounted,
      loadPremiumTiers,
    });

    return () => {
      isMounted = false;
    };
  }, [dispatchTierState]);
}
