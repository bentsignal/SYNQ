import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import type { CustomizationTheme } from "../hooks/use-customization-theme";
import type { getCustomizationScreenState } from "../services/customization-screen-state-service";

type CustomizationPremiumPanelProps = {
  panel: ReturnType<typeof getCustomizationScreenState>["premiumPanel"];
  theme: CustomizationTheme;
};

export function CustomizationPremiumPanel({
  panel,
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
          {panel.title}
        </Text>
        <Text
          className="text-[13px] leading-[19px]"
          style={{ color: theme.secondaryText }}
        >
          {panel.body}
        </Text>
      </View>
      <Link asChild href={panel.href}>
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
