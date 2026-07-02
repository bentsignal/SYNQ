import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
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

type PremiumEntitlementValue = {
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

const PremiumEntitlementContext =
  createContext<PremiumEntitlementValue | null>(null);

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

export function PremiumEntitlementProvider({
  children,
}: {
  children: ReactNode;
}) {
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

  const value = useMemo<PremiumEntitlementValue>(
    () => ({
      applyStatus,
      refresh,
      state,
    }),
    [applyStatus, refresh, state],
  );

  return (
    <PremiumEntitlementContext.Provider value={value}>
      {children}
    </PremiumEntitlementContext.Provider>
  );
}

export function usePremiumEntitlement() {
  const value = useContext(PremiumEntitlementContext);

  if (!value) {
    throw new Error(
      "usePremiumEntitlement must be used inside PremiumEntitlementProvider.",
    );
  }

  return value;
}
