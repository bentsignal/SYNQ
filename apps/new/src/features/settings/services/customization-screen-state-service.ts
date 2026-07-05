import type {
  CustomizationSettings,
  CustomizationSettingsStatus,
} from "../types/customization-settings";
import { getSettingsPremiumHref } from "./settings-navigation-service";
import { getCustomizationColorControlsState } from "./customization-color-controls-state-service";

export {
  getCustomizationColorControlsState,
  getCustomizationOptionState,
} from "./customization-color-controls-state-service";

export const getCustomizationScreenState = ({
  premiumActive,
  status,
}: {
  premiumActive: boolean;
  status: CustomizationSettingsStatus;
}) => ({
  hapticsDisabled: status === "loading",
  premiumPanel: {
    body: "Unlock theme and app icon choices with Premium.",
    href: getSettingsPremiumHref(),
    title: "Premium customization locked",
  },
  showPremiumPanel: !premiumActive,
  statusLabel: status === "saving" ? "Saving" : "Preferences saved locally",
  themeControlsDisabled: !premiumActive || status === "loading",
});

export const getCustomizationScreenControllerViewState = ({
  premiumActive,
  settings,
  status,
}: {
  premiumActive: boolean;
  settings: CustomizationSettings;
  status: CustomizationSettingsStatus;
}) => {
  const screenState = getCustomizationScreenState({
    premiumActive,
    status,
  });

  return {
    colorControlsState: getCustomizationColorControlsState({
      appIcon: settings.appIcon,
      disabled: screenState.themeControlsDisabled,
      themeKey: settings.theme,
    }),
    screenState,
  };
};

export type CustomizationScreenControllerViewState = ReturnType<
  typeof getCustomizationScreenControllerViewState
>;
