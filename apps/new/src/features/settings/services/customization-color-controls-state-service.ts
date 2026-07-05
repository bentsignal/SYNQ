import type { CustomizationColorKey } from "../types/customization-settings";
import { customizationOptions } from "./customization-settings-domain-service";

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
