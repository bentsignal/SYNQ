import { StyleSheet, Text, View } from "react-native";
import type { CustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { premiumFeatureCopy } from "../services/premium-screen-service";

type PremiumFeatureListProps = {
  theme: CustomizationTheme;
};

export function PremiumFeatureList({ theme }: PremiumFeatureListProps) {
  return (
    <View
      style={[
        styles.featureList,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      {premiumFeatureCopy.map((feature) => (
        <Text
          key={feature}
          style={[styles.featureText, { color: theme.primaryText }]}
        >
          {feature}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  featureList: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  featureText: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
});
