import { usePremiumEntitlementSelector } from "@/src/features/premium/state/PremiumEntitlementProvider";
import { settingsRoutes } from "../services/settings-navigation-service";
import { getSettingsHomeState } from "../services/settings-screen-service";

export function useSettingsHomeController() {
  const premiumActive = usePremiumEntitlementSelector(
    (store) => store.state.active,
  );
  const screenState = getSettingsHomeState({
    premiumActive,
  });

  return {
    routes: settingsRoutes,
    screenState,
  };
}

export type SettingsHomeController = ReturnType<
  typeof useSettingsHomeController
>;
