import { usePremiumEntitlementSelector } from "@/src/features/premium/state/PremiumEntitlementProvider";
import {
  getSettingsHomeControllerViewState,
} from "../services/settings-screen-service";

export function useSettingsHomeController() {
  const { applyStatus, premiumActive } = usePremiumEntitlementSelector(
    (store) => ({
      applyStatus: store.applyStatus,
      premiumActive: store.state.active,
    }),
  );
  const viewState = getSettingsHomeControllerViewState({
    isDev: __DEV__,
    premiumActive,
  });

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
    setDeveloperPremiumActive,
    ...viewState,
  };
}

export type SettingsHomeController = ReturnType<
  typeof useSettingsHomeController
>;
