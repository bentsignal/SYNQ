import { useCallback, useMemo, useReducer } from "react";
import {
  premiumTiers,
  purchasePremiumTier,
  restorePremiumPurchase,
} from "../services/premium-purchase-service";
import type {
  PremiumPurchaseResult,
  PremiumPurchaseState,
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
        selectedTierId: action.tierId,
      };
    case "start":
      return {
        ...state,
        error: null,
        phase: "loading",
      };
    case "succeed":
      return {
        ...state,
        active: true,
        error: null,
        phase: "success",
        selectedTierId: action.result.tierId,
      };
    case "fail":
      return {
        ...state,
        error: action.error,
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
      premiumTiers,
      purchaseSelectedTier,
      reset,
      restorePurchase,
      selectTier,
      state,
    }),
    [purchaseSelectedTier, reset, restorePurchase, selectTier, state],
  );
}
