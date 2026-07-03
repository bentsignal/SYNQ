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
import { getPremiumMutationErrorMessage } from "../services/premium-screen-service";
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
    dispatch({ status, type: "succeed" });
  }, []);

  const refresh = useCallback(async () => {
    dispatch({ type: "checking" });

    try {
      dispatch({
        status: await checkPremiumEntitlement(),
        type: "succeed",
      });
    } catch (caughtError) {
      dispatch({
        error: getPremiumMutationErrorMessage({
          caughtError,
          mutation: "check-entitlement",
        }),
        type: "fail",
      });
    }
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
