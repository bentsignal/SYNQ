import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { useImportSession } from "../hooks/use-import-session";
import { getImportSuccessState } from "../services/import-screen-state-service";

export function ImportSuccessScreen() {
  const { state } = useImportSession();
  const theme = useCustomizationTheme();
  const resultState = getImportSuccessState(state);

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.scroll, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: theme.accent }]}>
          Import complete
        </Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>
          Success
        </Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          {resultState.processedLabel}
        </Text>
      </View>

      <View
        style={[
          styles.panel,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.panelLabel, { color: theme.secondaryText }]}>
          Library save
        </Text>
        <Text style={[styles.panelText, { color: theme.primaryText }]}>
          {resultState.librarySaveLabel}
        </Text>
        {resultState.showLibraryHint ? (
          <Text style={[styles.pathText, { color: theme.mutedText }]}>
            Saved songs are ready in Library.
          </Text>
        ) : null}
      </View>

      <Link
        href="/(tabs)/library"
        style={[styles.backLink, { color: theme.accent }]}
      >
        Open Library
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
  pathText: {
    fontSize: 12,
    lineHeight: 17,
  },
  backLink: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
