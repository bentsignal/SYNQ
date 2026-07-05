import type {
  CustomizationColorKey,
  CustomizationSettings,
  CustomizationSettingsStatus,
} from "../types/customization-settings";
import { getSettingsPremiumHref } from "./settings-navigation-service";
import { customizationOptions } from "./customization-settings-domain-service";

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

export const getCustomizationOptionState = ({
  disabled,
  optionKey,
  selectedKey,
}: {
  disabled: boolean;
  optionKey: CustomizationColorKey;
  selectedKey: CustomizationColorKey;
}) => ({
  accessibilityState: {
    disabled,
    selected: optionKey === selectedKey,
  },
  isSelected: optionKey === selectedKey,
});

export const getCustomizationColorControlsState = ({
  appIcon,
  disabled,
  themeKey,
}: {
  appIcon: CustomizationColorKey;
  disabled: boolean;
  themeKey: CustomizationColorKey;
}) => ({
  rows: [
    {
      key: "theme",
      options: customizationOptions.map((option) => ({
        ...option,
        optionState: getCustomizationOptionState({
          disabled,
          optionKey: option.key,
          selectedKey: themeKey,
        }),
      })),
      title: "Theme",
    },
    {
      key: "app-icon",
      options: customizationOptions.map((option) => ({
        ...option,
        optionState: getCustomizationOptionState({
          disabled,
          optionKey: option.key,
          selectedKey: appIcon,
        }),
      })),
      title: "App Icon",
    },
  ],
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
