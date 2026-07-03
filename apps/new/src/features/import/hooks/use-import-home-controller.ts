import { usePremiumEntitlement } from "@/src/features/premium/context/PremiumEntitlementProvider";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { getImportHomeState } from "../services/import-home-screen-state-service";
import { useImportSession } from "./use-import-session";

export function useImportHomeController() {
  const { state } = useImportSession();
  const { sendHaptic } = useHapticFeedback();
  const { state: premiumState } = usePremiumEntitlement();
  const screenState = getImportHomeState({
    premiumActive: premiumState.active,
    state,
  });

  const selectImportRoute = () => {
    sendHaptic("light");
  };

  return {
    onSelectImportRoute: selectImportRoute,
    screenState,
  };
}

export type ImportHomeController = ReturnType<typeof useImportHomeController>;
