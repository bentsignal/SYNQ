import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import {
  loadPremiumTiers,
  premiumTiers,
  purchasePremiumTier,
  restorePremiumPurchase,
} from "../services/premium-purchase-service";
import type {
  PremiumPurchaseResult,
  PremiumPurchaseState,
  PremiumTier,
  PremiumTierId,
} from "../types/premium-purchase";

type PremiumPurchaseAction =
  | { tierId: PremiumTierId; type: "select" }
  | { type: "start" }
  | { result: PremiumPurchaseResult; type: "succeed" }
  | { error: string; type: "fail" }
  | { type: "reset" };

const initialPremiumPurchaseState: PremiumPurchaseState = {
  active: false,
  error: null,
  message: null,
  phase: "idle",
  selectedTierId: "monthly",
};

const premiumPurchaseReducer = (
  state: PremiumPurchaseState,
  action: PremiumPurchaseAction,
): PremiumPurchaseState => {
  switch (action.type) {
    case "select":
      return {
        ...state,
        error: null,
        message: null,
        selectedTierId: action.tierId,
      };
    case "start":
      return {
        ...state,
        error: null,
        message: null,
        phase: "loading",
      };
    case "succeed":
      return {
        ...state,
        active: action.result.active,
        error: null,
        message: action.result.message,
        phase: "success",
        selectedTierId: action.result.tierId,
      };
    case "fail":
      return {
        ...state,
        error: action.error,
        message: null,
        phase: "failure",
      };
    case "reset":
      return initialPremiumPurchaseState;
  }
};

export function usePremiumPurchaseSession() {
  const [state, dispatch] = useReducer(
    premiumPurchaseReducer,
    initialPremiumPurchaseState,
  );
  const [tiers, setTiers] = useState<PremiumTier[]>(premiumTiers);

  useEffect(() => {
    let isMounted = true;

    const loadTiers = async () => {
      try {
        const nextTiers = await loadPremiumTiers();
        if (isMounted) {
          setTiers(nextTiers);
        }
      } catch {
        if (isMounted) {
          setTiers(premiumTiers);
        }
      }
    };

    void loadTiers();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectTier = useCallback((tierId: PremiumTierId) => {
    dispatch({ tierId, type: "select" });
  }, []);

  const purchaseSelectedTier = useCallback(async () => {
    dispatch({ type: "start" });

    try {
      const result = await purchasePremiumTier(state.selectedTierId);
      dispatch({ result, type: "succeed" });
    } catch (caughtError) {
      dispatch({
        error:
          caughtError instanceof Error
            ? caughtError.message
            : "Premium purchase failed.",
        type: "fail",
      });
    }
  }, [state.selectedTierId]);

  const restorePurchase = useCallback(async () => {
    dispatch({ type: "start" });

    try {
      const result = await restorePremiumPurchase();
      dispatch({ result, type: "succeed" });
    } catch (caughtError) {
      dispatch({
        error:
          caughtError instanceof Error
            ? caughtError.message
            : "Premium restore failed.",
        type: "fail",
      });
    }
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "reset" });
  }, []);

  return useMemo(
    () => ({
      premiumTiers: tiers,
      purchaseSelectedTier,
      reset,
      restorePurchase,
      selectTier,
      state,
    }),
    [purchaseSelectedTier, reset, restorePurchase, selectTier, state, tiers],
  );
}
