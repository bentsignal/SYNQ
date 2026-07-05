import { Pressable, Text, View } from "react-native";
import type { CustomizationTheme } from "../hooks/use-customization-theme";
import type { getCustomizationColorControlsState } from "../services/settings-screen-service";
import type { CustomizationColorKey } from "../types/customization-settings";

type CustomizationColorControlsState = ReturnType<
  typeof getCustomizationColorControlsState
>;

type ColorOptionRowState = CustomizationColorControlsState["rows"][number];

type CustomizationColorControlsProps = {
  disabled: boolean;
  onSelectAppIcon: (key: CustomizationColorKey) => void;
  onSelectTheme: (key: CustomizationColorKey) => void;
  state: CustomizationColorControlsState;
  theme: CustomizationTheme;
};

type ColorOptionRowProps = {
  disabled?: boolean;
  onSelect: (key: CustomizationColorKey) => void;
  row: ColorOptionRowState;
  theme: CustomizationTheme;
};

function ColorOptionRow({
  disabled = false,
  onSelect,
  row,
  theme,
}: ColorOptionRowProps) {
  return (
    <View className={`gap-3 ${disabled ? "opacity-50" : ""}`}>
      <Text
        className="text-[17px] font-extrabold leading-[23px]"
        style={{ color: theme.primaryText }}
      >
        {row.title}
      </Text>
      <View className="flex-row flex-wrap gap-2.5">
        {row.options.map((option) => (
          <Pressable
            accessibilityRole="button"
            accessibilityState={option.optionState.accessibilityState}
            className={`min-h-[86px] min-w-[78px] items-center justify-center gap-2 rounded-lg border px-2.5 py-2.5 ${
              option.optionState.isSelected ? "border-2" : ""
            }`}
            disabled={disabled}
            key={option.key}
            onPress={() => onSelect(option.key)}
            style={{
              borderColor: option.optionState.isSelected
                ? theme.accent
                : theme.border,
            }}
          >
            <View
              className="h-9 w-9 rounded-[18px] border border-[rgba(18,20,23,0.16)]"
              style={{ backgroundColor: option.color }}
            />
            <Text
              className="text-xs font-bold leading-4"
              style={{ color: theme.secondaryText }}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

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
      <ColorOptionRow
        disabled={disabled}
        onSelect={onSelectTheme}
        row={state.rows[0]}
        theme={theme}
      />
      <ColorOptionRow
        disabled={disabled}
        onSelect={onSelectAppIcon}
        row={state.rows[1]}
        theme={theme}
      />
    </View>
  );
}
