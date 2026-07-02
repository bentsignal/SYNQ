import { usePremiumEntitlement } from "@/src/features/premium/context/PremiumEntitlementProvider";
import {
  getSettingsHomeState,
  settingsRoutes,
} from "../services/settings-screen-service";

export function useSettingsHomeController() {
  const { state: premiumState } = usePremiumEntitlement();
  const screenState = getSettingsHomeState({
    premiumActive: premiumState.active,
  });

  return {
    routes: settingsRoutes,
    screenState,
  };
}

export type SettingsHomeController = ReturnType<
  typeof useSettingsHomeController
>;
