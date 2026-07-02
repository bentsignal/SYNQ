import { StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { getImportSaveHeaderState } from "../services/import-screen-state-service";

export function ImportSaveHeader() {
  const theme = useCustomizationTheme();
  const headerState = getImportSaveHeaderState();

  return (
    <View style={styles.header}>
      <Text style={[styles.kicker, { color: theme.accent }]}>
        {headerState.kicker}
      </Text>
      <Text style={[styles.title, { color: theme.primaryText }]}>
        {headerState.title}
      </Text>
      <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
        {headerState.subtitle}
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
