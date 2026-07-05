import { settingsRoutes } from "./settings-navigation-service";

export {
  getCustomizationColorControlsState,
  getCustomizationOptionState,
  getCustomizationScreenControllerViewState,
  getCustomizationScreenState,
  type CustomizationScreenControllerViewState,
} from "./customization-screen-state-service";

export const getSettingsHomeState = ({
  premiumActive,
}: {
  premiumActive: boolean;
}) => ({
  premiumStatusLabel: premiumActive ? "Premium active" : "Premium inactive",
});

export const isSettingsDeveloperPremiumToggleVisible = ({
  isDev,
  showToggle = true,
}: {
  isDev: boolean;
  showToggle?: boolean;
}) => isDev && showToggle;

export const getSettingsDeveloperPremiumToggleState = ({
  premiumActive,
}: {
  premiumActive: boolean;
}) => ({
  description: "Override premium entitlement while running a development build.",
  disabled: false,
  title: "Developer Premium Toggle",
  value: premiumActive,
});

export const getSettingsHomeControllerViewState = ({
  isDev,
  premiumActive,
}: {
  isDev: boolean;
  premiumActive: boolean;
}) => {
  const showDeveloperPremiumToggle = isSettingsDeveloperPremiumToggleVisible({
    isDev,
  });

  return {
    developerPremiumToggleState: showDeveloperPremiumToggle
      ? getSettingsDeveloperPremiumToggleState({ premiumActive })
      : null,
    routes: settingsRoutes,
    screenState: getSettingsHomeState({
      premiumActive,
    }),
  };
};

export type SettingsHomeControllerViewState = ReturnType<
  typeof getSettingsHomeControllerViewState
>;
