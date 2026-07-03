import { Switch, Text, View } from "react-native";
import type { CustomizationTheme } from "../hooks/use-customization-theme";

type SettingsSwitchRowProps = {
  description: string;
  disabled: boolean;
  onChange: (enabled: boolean) => void;
  theme: CustomizationTheme;
  title: string;
  trackColorOff?: string;
  value: boolean;
};

export function SettingsSwitchRow({
  description,
  disabled,
  onChange,
  theme,
  title,
  trackColorOff,
  value,
}: SettingsSwitchRowProps) {
  return (
    <View
      className="min-h-[78px] flex-row items-center gap-3.5 rounded-lg border px-4 py-3.5"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      <View className="min-w-0 flex-1 gap-[5px]">
        <Text
          className="text-base font-extrabold leading-[21px]"
          style={{ color: theme.primaryText }}
        >
          {title}
        </Text>
        <Text
          className="text-[13px] leading-[19px]"
          style={{ color: theme.secondaryText }}
        >
          {description}
        </Text>
      </View>
      <Switch
        disabled={disabled}
        onValueChange={onChange}
        thumbColor={theme.surface}
        trackColor={{
          false: trackColorOff ?? theme.border,
          true: theme.accent,
        }}
        value={value}
      />
    </View>
  );
}
