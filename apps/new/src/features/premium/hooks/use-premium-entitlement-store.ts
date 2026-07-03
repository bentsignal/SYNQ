import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { checkPremiumEntitlement } from "../services/premium-purchase-service";
import {
  initialPremiumEntitlementState,
  premiumEntitlementReducer,
  type PremiumEntitlementState,
} from "../services/premium-entitlement-state-service";
import {
  runPremiumEntitlementApplyCommand,
  runPremiumEntitlementRefreshCommand,
} from "../services/premium-entitlement-command-flow-service";
import type { PremiumEntitlementStatus } from "../types/premium-purchase";

export type PremiumEntitlementValue = {
  applyStatus: (status: PremiumEntitlementStatus) => void;
  refresh: () => Promise<void>;
  state: PremiumEntitlementState;
};

export function usePremiumEntitlementStore(): PremiumEntitlementValue {
  const [state, dispatch] = useReducer(
    premiumEntitlementReducer,
    initialPremiumEntitlementState,
  );

  const applyStatus = useCallback((status: PremiumEntitlementStatus) => {
    runPremiumEntitlementApplyCommand({ dispatch, status });
  }, []);

  const refresh = useCallback(async () => {
    await runPremiumEntitlementRefreshCommand({
      checkPremiumEntitlement,
      dispatch,
    });
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return useMemo<PremiumEntitlementValue>(
    () => ({
      applyStatus,
      refresh,
      state,
    }),
    [applyStatus, refresh, state],
  );
}
