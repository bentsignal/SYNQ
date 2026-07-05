import { Text, View } from "react-native";
import type { CustomizationTheme } from "../../hooks/use-customization-theme";
import type { SettingsScreenHeaderState } from "./SettingsScreenTypes";

export function SettingsScreenHeader({
  header,
  subtitleClassName,
  theme,
}: {
  header: SettingsScreenHeaderState;
  subtitleClassName?: string;
  theme: CustomizationTheme;
}) {
  return (
    <View className="gap-2">
      <Text
        className="text-[13px] font-extrabold uppercase"
        style={{ color: theme.accent }}
      >
        {header.kicker}
      </Text>
      <Text
        className="text-[34px] font-extrabold leading-10"
        style={{ color: theme.primaryText }}
      >
        {header.title}
      </Text>
      <Text
        className={`max-w-[560px] text-[15px] leading-[22px] ${
          subtitleClassName ?? ""
        }`}
        style={{ color: theme.secondaryText }}
      >
        {header.subtitle}
      </Text>
      {header.statusLabel ? (
        <Text
          className="text-[13px] font-extrabold uppercase"
          style={{ color: theme.accent }}
        >
          {header.statusLabel}
        </Text>
      ) : null}
    </View>
  );
}

