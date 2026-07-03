import { usePremiumEntitlementSelector } from "@/src/features/premium/state/PremiumEntitlementProvider";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { getImportHomeState } from "../services/import-home-screen-state-service";
import { useImportSessionSelector } from "./use-import-session";

export function useImportHomeController() {
  const state = useImportSessionSelector((store) => store.state);
  const { sendHaptic } = useHapticFeedback();
  const premiumActive = usePremiumEntitlementSelector(
    (store) => store.state.active,
  );
  const screenState = getImportHomeState({
    premiumActive,
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
