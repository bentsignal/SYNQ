import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { usePremiumScreenController } from "../hooks/use-premium-screen-controller";
import {
  premiumFeatureCopy,
} from "../services/premium-screen-service";
import type { PremiumTier } from "../types/premium-purchase";

export function PremiumScreen() {
  const theme = useCustomizationTheme();
  const {
    actionState,
    premiumTiers,
    purchase,
    reset,
    restore,
    selectTier,
    state,
    statusState,
  } = usePremiumScreenController();

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.scroll, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: theme.accent }]}>
          SYNQ Premium
        </Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>
          Premium
        </Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          Unlock the full library workflow and keep the app sustainable.
        </Text>
      </View>

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

      <View style={styles.tierList}>
        {premiumTiers.map((tier) => (
          <PremiumTierCard
            isSelected={tier.id === state.selectedTierId}
            key={tier.id}
            onSelect={() => selectTier(tier.id)}
            tier={tier}
            theme={theme}
          />
        ))}
      </View>

      <View style={styles.actionRow}>
        <Pressable
          accessibilityRole="button"
          disabled={!actionState.canPurchase}
          onPress={purchase}
          style={[
            styles.primaryButton,
            { backgroundColor: theme.accent },
            !actionState.canPurchase ? styles.disabled : null,
          ]}
        >
          <Text style={[styles.primaryButtonText, { color: theme.onAccent }]}>
            {actionState.purchaseLabel}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={!actionState.canRestore}
          onPress={restore}
          style={[
            styles.secondaryButton,
            { backgroundColor: theme.surface, borderColor: theme.border },
            !actionState.canRestore ? styles.disabled : null,
          ]}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.accent }]}>
            Restore
          </Text>
        </Pressable>
      </View>

      <View
        style={[
          styles.panel,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.panelLabel, { color: theme.secondaryText }]}>
          Status
        </Text>
        <Text
          style={[
            statusState.isFailure ? styles.errorText : styles.panelText,
            {
              color: statusState.isFailure ? theme.danger : theme.primaryText,
            },
          ]}
        >
          {statusState.message}
        </Text>
        {statusState.canReset ? (
          <Pressable
            accessibilityRole="button"
            onPress={reset}
            style={[styles.resetButton, { borderColor: theme.border }]}
          >
            <Text style={[styles.resetButtonText, { color: theme.accent }]}>
              Reset status
            </Text>
          </Pressable>
        ) : null}
      </View>

      <Link href="/(tabs)/settings" style={[styles.backLink, { color: theme.accent }]}>
        Back to Settings
      </Link>
    </ScrollView>
  );
}

function PremiumTierCard({
  isSelected,
  onSelect,
  tier,
  theme,
}: {
  isSelected: boolean;
  onSelect: () => void;
  tier: PremiumTier;
  theme: ReturnType<typeof useCustomizationTheme>;
}) {
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

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    gap: 20,
    paddingHorizontal: 20,
    paddingVertical: 56,
  },
  header: {
    gap: 8,
  },
  kicker: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 520,
  },
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
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  primaryButton: {
    alignItems: "center",
    borderRadius: 8,
    flexGrow: 1,
    justifyContent: "center",
    minHeight: 46,
    minWidth: 160,
    paddingHorizontal: 14,
  },
  secondaryButton: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flexGrow: 1,
    justifyContent: "center",
    minHeight: 46,
    minWidth: 110,
    paddingHorizontal: 14,
  },
  disabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  panel: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  panelLabel: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  panelText: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  resetButton: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 38,
    paddingHorizontal: 12,
  },
  resetButtonText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  backLink: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
