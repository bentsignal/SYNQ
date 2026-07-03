import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import type { CustomizationTheme } from "../hooks/use-customization-theme";
import { getSettingsPremiumHref } from "../services/settings-navigation-service";

type CustomizationPremiumPanelProps = {
  theme: CustomizationTheme;
};

export function CustomizationPremiumPanel({
  theme,
}: CustomizationPremiumPanelProps) {
  return (
    <View
      className="flex-row items-center gap-3.5 rounded-lg border p-4"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      <View className="min-w-0 flex-1 gap-[5px]">
        <Text
          className="text-base font-extrabold leading-[22px]"
          style={{ color: theme.primaryText }}
        >
          Premium customization locked
        </Text>
        <Text
          className="text-[13px] leading-[19px]"
          style={{ color: theme.secondaryText }}
        >
          Unlock theme and app icon choices with Premium.
        </Text>
      </View>
      <Link asChild href={getSettingsPremiumHref()}>
        <Pressable
          className="min-h-10 items-center justify-center rounded-lg px-3.5"
          style={{ backgroundColor: theme.accent }}
        >
          <Text
            className="text-[13px] font-extrabold uppercase"
            style={{ color: theme.onAccent }}
          >
            Premium
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}
