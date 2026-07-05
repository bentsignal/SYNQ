import { usePremiumEntitlementSelector } from "@/src/features/premium/state/PremiumEntitlementProvider";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { runImportPremiumGateAction } from "../services/import-premium-gate-action-flow-service";
import { getImportPremiumGateState } from "../services/import-premium-gate-state-service";

export function useImportPremiumGateController() {
  const state = usePremiumEntitlementSelector((store) => store.state);
  const { sendHaptic } = useHapticFeedback();
  const gateState = getImportPremiumGateState(state);

  const selectPremiumAction = () => {
    runImportPremiumGateAction({ sendHaptic });
  };

  return {
    gateState,
    onSelectPremiumAction: selectPremiumAction,
  };
}

export type ImportPremiumGateController = ReturnType<
  typeof useImportPremiumGateController
>;
