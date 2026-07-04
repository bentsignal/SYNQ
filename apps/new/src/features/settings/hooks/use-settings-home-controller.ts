import { usePremiumEntitlementSelector } from "@/src/features/premium/state/PremiumEntitlementProvider";
import { settingsRoutes } from "../services/settings-navigation-service";
import {
  getSettingsDeveloperPremiumToggleState,
  getSettingsHomeState,
  isSettingsDeveloperPremiumToggleVisible,
} from "../services/settings-screen-service";

export function useSettingsHomeController() {
  const { applyStatus, premiumActive } = usePremiumEntitlementSelector(
    (store) => ({
      applyStatus: store.applyStatus,
      premiumActive: store.state.active,
    }),
  );
  const screenState = getSettingsHomeState({
    premiumActive,
  });
  const showDeveloperPremiumToggle = isSettingsDeveloperPremiumToggleVisible({
    isDev: __DEV__,
  });
  const developerPremiumToggleState = showDeveloperPremiumToggle
    ? getSettingsDeveloperPremiumToggleState({ premiumActive })
    : null;

  const setDeveloperPremiumActive = (active: boolean) => {
    applyStatus({
      active,
      message: active
        ? "Developer premium override enabled."
        : "Developer premium override disabled.",
      tierId: active ? "lifetime" : "monthly",
    });
  };

  return {
    developerPremiumToggleState,
    routes: settingsRoutes,
    screenState,
    setDeveloperPremiumActive,
  };
}

export type SettingsHomeController = ReturnType<
  typeof useSettingsHomeController
>;
