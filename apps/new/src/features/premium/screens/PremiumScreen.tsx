import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { usePremiumPurchaseSession } from "../hooks/use-premium-purchase-session";
import {
  getPremiumActionState,
  getPremiumStatusState,
  getSelectedPremiumTier,
  premiumFeatureCopy,
} from "../services/premium-screen-service";
import type { PremiumTier } from "../types/premium-purchase";

export function PremiumScreen() {
  const {
    premiumTiers,
    purchaseSelectedTier,
    reset,
    restorePurchase,
    selectTier,
    state,
  } = usePremiumPurchaseSession();
  const selectedTier = getSelectedPremiumTier({ state, tiers: premiumTiers });
  const actionState = getPremiumActionState({ selectedTier, state });
  const statusState = getPremiumStatusState(state);

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
      <View style={styles.header}>
        <Text style={styles.kicker}>SYNQ Premium</Text>
        <Text style={styles.title}>Premium</Text>
        <Text style={styles.subtitle}>
          Unlock the full library workflow and keep the app sustainable.
        </Text>
      </View>

      <View style={styles.featureList}>
        {premiumFeatureCopy.map((feature) => (
          <Text key={feature} style={styles.featureText}>
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
          />
        ))}
      </View>

      <View style={styles.actionRow}>
        <Pressable
          accessibilityRole="button"
          disabled={!actionState.canPurchase}
          onPress={() => void purchaseSelectedTier()}
          style={[
            styles.primaryButton,
            !actionState.canPurchase ? styles.disabled : null,
          ]}
        >
          <Text style={styles.primaryButtonText}>
            {actionState.purchaseLabel}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={!actionState.canRestore}
          onPress={() => void restorePurchase()}
          style={[
            styles.secondaryButton,
            !actionState.canRestore ? styles.disabled : null,
          ]}
        >
          <Text style={styles.secondaryButtonText}>Restore</Text>
        </Pressable>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelLabel}>Status</Text>
        <Text
          style={statusState.isFailure ? styles.errorText : styles.panelText}
        >
          {statusState.message}
        </Text>
        {statusState.canReset ? (
          <Pressable
            accessibilityRole="button"
            onPress={reset}
            style={styles.resetButton}
          >
            <Text style={styles.resetButtonText}>Reset status</Text>
          </Pressable>
        ) : null}
      </View>

      <Link href="/(tabs)/settings" style={styles.backLink}>
        Back to Settings
      </Link>
    </ScrollView>
  );
}

function PremiumTierCard({
  isSelected,
  onSelect,
  tier,
}: {
  isSelected: boolean;
  onSelect: () => void;
  tier: PremiumTier;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onSelect}
      style={[styles.tierCard, isSelected ? styles.selectedTierCard : null]}
    >
      <View style={styles.tierText}>
        <Text style={styles.tierTitle}>{tier.label}</Text>
        <Text style={styles.tierDescription}>{tier.description}</Text>
      </View>
      <Text style={styles.tierPrice}>{tier.price}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: "#f4f7f5",
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
    color: "#0f766e",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    color: "#121417",
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 40,
  },
  subtitle: {
    color: "#52605a",
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 520,
  },
  featureList: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  featureText: {
    color: "#29322e",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  tierList: {
    gap: 12,
  },
  tierCard: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    minHeight: 82,
    padding: 16,
  },
  selectedTierCard: {
    borderColor: "#0f766e",
    borderWidth: 2,
  },
  tierText: {
    flex: 1,
    gap: 5,
    minWidth: 0,
  },
  tierTitle: {
    color: "#121417",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 24,
  },
  tierDescription: {
    color: "#52605a",
    fontSize: 13,
    lineHeight: 19,
  },
  tierPrice: {
    color: "#0f766e",
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
    backgroundColor: "#0f766e",
    borderRadius: 8,
    flexGrow: 1,
    justifyContent: "center",
    minHeight: 46,
    minWidth: 160,
    paddingHorizontal: 14,
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
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
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  secondaryButtonText: {
    color: "#0f766e",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  panel: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  panelLabel: {
    color: "#52605a",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  panelText: {
    color: "#29322e",
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    color: "#b42318",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  resetButton: {
    alignItems: "center",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 38,
    paddingHorizontal: 12,
  },
  resetButtonText: {
    color: "#0f766e",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  backLink: {
    color: "#0f766e",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
