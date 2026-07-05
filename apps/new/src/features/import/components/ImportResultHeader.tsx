import { Text, View } from "react-native";
import type { CustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

type ImportResultHeaderProps = {
  kicker: string;
  subtitle: string;
  theme: CustomizationTheme;
  title: string;
  tone: "accent" | "danger";
};

export function ImportResultHeader({
  kicker,
  subtitle,
  theme,
  title,
  tone,
}: ImportResultHeaderProps) {
  return (
    <View className="gap-2">
      <Text
        className="text-[13px] font-extrabold uppercase"
        style={{ color: theme[tone] }}
      >
        {kicker}
      </Text>
      <Text
        className="text-[34px] font-extrabold leading-10"
        style={{ color: theme.primaryText }}
      >
        {title}
      </Text>
      <Text
        className="max-w-[520px] text-[15px] leading-[22px]"
        style={{ color: theme.secondaryText }}
      >
        {subtitle}
      </Text>
    </View>
  );
}
