import { Pressable, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { BackupActionCard as BackupActionCardConfig } from "../services/backup-screen-service";
import type { BackupOperation } from "../types/backup-session";

type BackupActionState = {
  buttonLabel: string;
  isDanger: boolean;
  isDisabled: boolean;
  showPremiumBadge: boolean;
};

type BackupActionCardProps = {
  action: BackupActionCardConfig;
  actionState: BackupActionState;
  onRunOperation: (operation: BackupOperation) => void;
};

export function BackupActionCard({
  action,
  actionState,
  onRunOperation,
}: BackupActionCardProps) {
  const theme = useCustomizationTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <View style={styles.cardText}>
        <View style={styles.cardTitleRow}>
          <Text style={[styles.cardTitle, { color: theme.primaryText }]}>
            {action.title}
          </Text>
          {actionState.showPremiumBadge ? (
            <Text
              style={[
                styles.premiumPill,
                { borderColor: theme.border, color: theme.accent },
              ]}
            >
              Premium
            </Text>
          ) : null}
        </View>
        <Text style={[styles.cardBody, { color: theme.secondaryText }]}>
          {action.body}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        disabled={actionState.isDisabled}
        onPress={() => onRunOperation(action.operation)}
        style={[
          actionState.isDanger ? styles.dangerButton : styles.primaryButton,
          {
            backgroundColor: actionState.isDanger
              ? theme.danger
              : theme.accent,
          },
          actionState.isDisabled ? styles.disabled : null,
        ]}
      >
        <Text style={[styles.buttonText, { color: theme.onAccent }]}>
          {actionState.buttonLabel}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  cardText: {
    gap: 8,
  },
  cardTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  cardTitle: {
    flexShrink: 1,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 24,
  },
  premiumPill: {
    backgroundColor: "#e8f3ef",
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 4,
    textTransform: "uppercase",
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  primaryButton: {
    alignItems: "center",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 14,
  },
  dangerButton: {
    alignItems: "center",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 14,
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
});
