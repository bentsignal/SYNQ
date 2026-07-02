import { Pressable, StyleSheet, Text, View } from "react-native";
import type { CustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { PremiumActionState } from "../services/premium-screen-service";

type PremiumActionRowProps = {
  actionState: PremiumActionState;
  onPurchase: () => void;
  onRestore: () => void;
  theme: CustomizationTheme;
};

export function PremiumActionRow({
  actionState,
  onPurchase,
  onRestore,
  theme,
}: PremiumActionRowProps) {
  return (
    <View style={styles.actionRow}>
      <Pressable
        accessibilityRole="button"
        disabled={!actionState.canPurchase}
        onPress={onPurchase}
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
        onPress={onRestore}
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
  );
}

const styles = StyleSheet.create({
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
});
