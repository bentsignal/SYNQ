import { StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

export function ImportWifiHeader() {
  const theme = useCustomizationTheme();

  return (
    <View style={styles.header}>
      <Text style={[styles.kicker, { color: theme.accent }]}>
        Wi-Fi import
      </Text>
      <Text style={[styles.title, { color: theme.primaryText }]}>Transfer</Text>
      <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
        Open the local address from a browser on the same network and send audio
        files into this review session.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
  },
  kicker: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 520,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 40,
  },
});
