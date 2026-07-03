import { Pressable, Text, View } from "react-native";
import type { CustomizationTheme } from "../hooks/use-customization-theme";
import { customizationOptions } from "../services/customization-settings-domain-service";
import { getCustomizationOptionState } from "../services/settings-screen-service";
import type { CustomizationColorKey } from "../types/customization-settings";

type CustomizationColorControlsProps = {
  appIcon: CustomizationColorKey;
  disabled: boolean;
  onSelectAppIcon: (key: CustomizationColorKey) => void;
  onSelectTheme: (key: CustomizationColorKey) => void;
  theme: CustomizationTheme;
  themeKey: CustomizationColorKey;
};

type ColorOptionRowProps = {
  disabled?: boolean;
  onSelect: (key: CustomizationColorKey) => void;
  selectedKey: CustomizationColorKey;
  theme: CustomizationTheme;
  title: string;
};

function ColorOptionRow({
  disabled = false,
  onSelect,
  selectedKey,
  theme,
  title,
}: ColorOptionRowProps) {
  return (
    <View className={`gap-3 ${disabled ? "opacity-50" : ""}`}>
      <Text
        className="text-[17px] font-extrabold leading-[23px]"
        style={{ color: theme.primaryText }}
      >
        {title}
      </Text>
      <View className="flex-row flex-wrap gap-2.5">
        {customizationOptions.map((option) => {
          const optionState = getCustomizationOptionState({
            disabled,
            optionKey: option.key,
            selectedKey,
          });

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={optionState.accessibilityState}
              disabled={disabled}
              key={option.key}
              onPress={() => onSelect(option.key)}
              className={`min-h-[86px] min-w-[78px] items-center justify-center gap-2 rounded-lg border px-2.5 py-2.5 ${
                optionState.isSelected ? "border-2" : ""
              }`}
              style={{
                borderColor: optionState.isSelected
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
          );
        })}
      </View>
    </View>
  );
}

export function CustomizationColorControls({
  appIcon,
  disabled,
  onSelectAppIcon,
  onSelectTheme,
  theme,
  themeKey,
}: CustomizationColorControlsProps) {
  return (
    <View
      className="gap-[18px] rounded-lg border p-4"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      <ColorOptionRow
        disabled={disabled}
        onSelect={onSelectTheme}
        selectedKey={themeKey}
        theme={theme}
        title="Theme"
      />
      <ColorOptionRow
        disabled={disabled}
        onSelect={onSelectAppIcon}
        selectedKey={appIcon}
        theme={theme}
        title="App Icon"
      />
    </View>
  );
}
