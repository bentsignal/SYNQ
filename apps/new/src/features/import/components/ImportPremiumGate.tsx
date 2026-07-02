import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { usePremiumEntitlement } from "@/src/features/premium/context/PremiumEntitlementProvider";

type ImportPremiumGateProps = {
  children: React.ReactNode;
};

export function ImportPremiumGate({ children }: ImportPremiumGateProps) {
  const { state } = usePremiumEntitlement();

  if (state.active) {
    return children;
  }

  return (
    <View style={styles.panel}>
      <Text style={styles.kicker}>
        {state.phase === "checking" ? "Checking premium" : "Premium import"}
      </Text>
      <Text style={styles.title}>Import is a Premium feature</Text>
      <Text style={styles.body}>
        Unlock file and Wi-Fi import before staging new songs.
      </Text>
      {state.error ? <Text style={styles.errorText}>{state.error}</Text> : null}
      <Link asChild href="/premium">
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Open Premium</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  kicker: {
    color: "#0f766e",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    color: "#121417",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 26,
  },
  body: {
    color: "#52605a",
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    color: "#b42318",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  button: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#0f766e",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 42,
    paddingHorizontal: 14,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
});
