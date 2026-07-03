import { Pressable, Text, View } from "react-native";
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
      className="min-h-[82px] flex-row items-center gap-3.5 rounded-lg border p-4"
      onPress={onSelect}
      style={[
        { backgroundColor: theme.surface, borderColor: theme.border },
        isSelected ? { borderColor: theme.accent, borderWidth: 2 } : null,
      ]}
    >
      <View className="min-w-0 flex-1 gap-[5px]">
        <Text
          className="text-lg font-extrabold leading-6"
          style={{ color: theme.primaryText }}
        >
          {tier.label}
        </Text>
        <Text
          className="text-[13px] leading-[19px]"
          style={{ color: theme.secondaryText }}
        >
          {tier.description}
        </Text>
      </View>
      <Text
        className="min-w-11 text-right text-lg font-extrabold"
        style={{ color: theme.accent }}
      >
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
    <View className="gap-3">
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
