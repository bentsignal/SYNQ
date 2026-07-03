import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { createStore } from "rostra";
import { checkPremiumEntitlement } from "../services/premium-purchase-service";
import { getPremiumMutationErrorMessage } from "../services/premium-screen-service";
import type {
  PremiumEntitlementStatus,
  PremiumTierId,
} from "../types/premium-purchase";

type PremiumEntitlementPhase = "checking" | "failure" | "ready";

type PremiumEntitlementState = {
  active: boolean;
  error: string | null;
  message: string | null;
  phase: PremiumEntitlementPhase;
  tierId: PremiumTierId;
};

type PremiumEntitlementAction =
  | { type: "checking" }
  | { error: string; type: "fail" }
  | { status: PremiumEntitlementStatus; type: "succeed" };

export type PremiumEntitlementValue = {
  applyStatus: (status: PremiumEntitlementStatus) => void;
  refresh: () => Promise<void>;
  state: PremiumEntitlementState;
};

const initialPremiumEntitlementState: PremiumEntitlementState = {
  active: false,
  error: null,
  message: null,
  phase: "checking",
  tierId: "monthly",
};

const premiumEntitlementReducer = (
  state: PremiumEntitlementState,
  action: PremiumEntitlementAction,
): PremiumEntitlementState => {
  switch (action.type) {
    case "checking":
      return {
        ...state,
        error: null,
        phase: "checking",
      };
    case "fail":
      return {
        ...state,
        error: action.error,
        phase: "failure",
      };
    case "succeed":
      return {
        active: action.status.active,
        error: null,
        message: action.status.message,
        phase: "ready",
        tierId: action.status.tierId,
      };
  }
};

function usePremiumEntitlementStore(): PremiumEntitlementValue {
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

const { Store, useStore } = createStore<object, PremiumEntitlementValue>(
  usePremiumEntitlementStore,
);

export function PremiumEntitlementProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <Store>{children}</Store>;
}

export function usePremiumEntitlementSelector<SelectedValue>(
  selector: (store: PremiumEntitlementValue) => SelectedValue,
) {
  return useStore(selector);
}

export function usePremiumEntitlement() {
  return usePremiumEntitlementSelector((store) => store);
}
