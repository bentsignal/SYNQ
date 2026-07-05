import { Pressable, Text, View } from "react-native";
import type { CustomizationTheme } from "../hooks/use-customization-theme";
import type { CustomizationColorControlsRowState } from "../services/customization-color-controls-state-service";
import type { CustomizationColorKey } from "../types/customization-settings";

type CustomizationColorOptionRowProps = {
  disabled?: boolean;
  onSelect: (key: CustomizationColorKey) => void;
  row: CustomizationColorControlsRowState;
  theme: CustomizationTheme;
};

export function CustomizationColorOptionRow({
  disabled = false,
  onSelect,
  row,
  theme,
}: CustomizationColorOptionRowProps) {
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
