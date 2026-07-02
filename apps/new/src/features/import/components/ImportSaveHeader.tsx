import { StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

export function ImportSaveHeader() {
  const theme = useCustomizationTheme();

  return (
    <View style={styles.header}>
      <Text style={[styles.kicker, { color: theme.accent }]}>
        Import review
      </Text>
      <Text style={[styles.title, { color: theme.primaryText }]}>Save</Text>
      <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
        Review staged songs before writing them to the library.
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
