import { Pressable, StyleSheet, Text, View } from "react-native";
import type { CustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { PremiumTier, PremiumTierId } from "../types/premium-purchase";

type PremiumTierListProps = {
  onSelectTier: (tierId: PremiumTierId) => void;
  selectedTierId: PremiumTierId;
  theme: CustomizationTheme;
  tiers: PremiumTier[];
};

type PremiumTierCardProps = {
  isSelected: boolean;
  onSelect: () => void;
  theme: CustomizationTheme;
  tier: PremiumTier;
};

function PremiumTierCard({
  isSelected,
  onSelect,
  theme,
  tier,
}: PremiumTierCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onSelect}
      style={[
        styles.tierCard,
        { backgroundColor: theme.surface, borderColor: theme.border },
        isSelected ? { borderColor: theme.accent, borderWidth: 2 } : null,
      ]}
    >
      <View style={styles.tierText}>
        <Text style={[styles.tierTitle, { color: theme.primaryText }]}>
          {tier.label}
        </Text>
        <Text style={[styles.tierDescription, { color: theme.secondaryText }]}>
          {tier.description}
        </Text>
      </View>
      <Text style={[styles.tierPrice, { color: theme.accent }]}>
        {tier.price}
      </Text>
    </Pressable>
  );
}

export function PremiumTierList({
  onSelectTier,
  selectedTierId,
  theme,
  tiers,
}: PremiumTierListProps) {
  return (
    <View style={styles.tierList}>
      {tiers.map((tier) => (
        <PremiumTierCard
          isSelected={tier.id === selectedTierId}
          key={tier.id}
          onSelect={() => onSelectTier(tier.id)}
          theme={theme}
          tier={tier}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tierList: {
    gap: 12,
  },
  tierCard: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    minHeight: 82,
    padding: 16,
  },
  tierText: {
    flex: 1,
    gap: 5,
    minWidth: 0,
  },
  tierTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 24,
  },
  tierDescription: {
    fontSize: 13,
    lineHeight: 19,
  },
  tierPrice: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0,
    minWidth: 44,
    textAlign: "right",
  },
});
