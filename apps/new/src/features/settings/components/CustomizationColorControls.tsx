import { View } from "react-native";
import type { CustomizationTheme } from "../hooks/use-customization-theme";
import type { getCustomizationColorControlsState } from "../services/customization-color-controls-state-service";
import type { CustomizationColorKey } from "../types/customization-settings";
import { CustomizationColorOptionRow } from "./CustomizationColorOptionRow";

type CustomizationColorControlsState = ReturnType<
  typeof getCustomizationColorControlsState
>;

type CustomizationColorControlsProps = {
  disabled: boolean;
  onSelectAppIcon: (key: CustomizationColorKey) => void;
  onSelectTheme: (key: CustomizationColorKey) => void;
  state: CustomizationColorControlsState;
  theme: CustomizationTheme;
};

export function CustomizationColorControls({
  disabled,
  onSelectAppIcon,
  onSelectTheme,
  state,
  theme,
}: CustomizationColorControlsProps) {
  return (
    <View
      className="gap-[18px] rounded-lg border p-4"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      <CustomizationColorOptionRow
        disabled={disabled}
        onSelect={onSelectTheme}
        row={state.themeRow}
        theme={theme}
      />
      <CustomizationColorOptionRow
        disabled={disabled}
        onSelect={onSelectAppIcon}
        row={state.appIconRow}
        theme={theme}
      />
    </View>
  );
}
