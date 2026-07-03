import { Text, View } from "react-native";
import type { CustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { premiumFeatureCopy } from "../services/premium-screen-service";

type PremiumFeatureListProps = {
  theme: CustomizationTheme;
};

export function PremiumFeatureList({ theme }: PremiumFeatureListProps) {
  return (
    <View
      className="gap-2.5 rounded-lg border p-4"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      {premiumFeatureCopy.map((feature) => (
        <Text
          className="text-sm font-bold leading-5"
          key={feature}
          style={{ color: theme.primaryText }}
        >
          {feature}
        </Text>
      ))}
    </View>
  );
}
