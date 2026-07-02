import { Pressable, StyleSheet, Text, View } from "react-native";
import type { CustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { PremiumStatusState } from "../services/premium-screen-service";

type PremiumStatusPanelProps = {
  onReset: () => void;
  statusState: PremiumStatusState;
  theme: CustomizationTheme;
};

export function PremiumStatusPanel({
  onReset,
  statusState,
  theme,
}: PremiumStatusPanelProps) {
  return (
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
          onPress={onReset}
          style={[styles.resetButton, { borderColor: theme.border }]}
        >
          <Text style={[styles.resetButtonText, { color: theme.accent }]}>
            Reset status
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
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
});
