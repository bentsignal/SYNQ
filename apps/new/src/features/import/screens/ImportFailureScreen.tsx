import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { useImportSession } from "../hooks/use-import-session";
import { getImportFailureState } from "../services/import-screen-state-service";

export function ImportFailureScreen() {
  const { state } = useImportSession();
  const theme = useCustomizationTheme();
  const resultState = getImportFailureState(state);

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.scroll, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: theme.danger }]}>
          Import stopped
        </Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>
          Failure
        </Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          {resultState.errorLabel}
        </Text>
      </View>

      <View
        style={[
          styles.panel,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.panelLabel, { color: theme.secondaryText }]}>
          Phase
        </Text>
        <Text style={[styles.panelText, { color: theme.primaryText }]}>
          {resultState.phaseLabel}
        </Text>
      </View>

      <Link
        href="/(tabs)/import/files"
        style={[styles.backLink, { color: theme.accent }]}
      >
        Back to files
      </Link>
    </ScrollView>
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
  panel: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
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
  backLink: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
