import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { usePremiumEntitlement } from "@/src/features/premium/context/PremiumEntitlementProvider";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { getImportPremiumGateState } from "../services/import-premium-gate-state-service";

type ImportPremiumGateProps = {
  children: React.ReactNode;
};

export function ImportPremiumGate({ children }: ImportPremiumGateProps) {
  const { state } = usePremiumEntitlement();
  const theme = useCustomizationTheme();
  const { sendHaptic } = useHapticFeedback();
  const gateState = getImportPremiumGateState(state);

  if (gateState.canAccessImport) {
    return children;
  }

  return (
    <View
      style={[
        styles.panel,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <Text style={[styles.kicker, { color: theme.accent }]}>
        {gateState.kicker}
      </Text>
      <Text style={[styles.title, { color: theme.primaryText }]}>
        {gateState.title}
      </Text>
      <Text style={[styles.body, { color: theme.secondaryText }]}>
        {gateState.body}
      </Text>
      {gateState.error ? (
        <Text style={[styles.errorText, { color: theme.danger }]}>
          {gateState.error}
        </Text>
      ) : null}
      <Link asChild href={gateState.action.href}>
        <Pressable
          onPress={() => sendHaptic("light")}
          style={[styles.button, { backgroundColor: theme.accent }]}
        >
          <Text style={[styles.buttonText, { color: theme.onAccent }]}>
            {gateState.action.label}
          </Text>
        </Pressable>
      </Link>
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
  kicker: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 26,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  button: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 42,
    paddingHorizontal: 14,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
});
