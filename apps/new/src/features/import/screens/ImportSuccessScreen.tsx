import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { useImportSession } from "../hooks/use-import-session";

export function ImportSuccessScreen() {
  const { state } = useImportSession();
  const theme = useCustomizationTheme();
  const savedIds = state.saveSummary?.savedSongIds ?? [];

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
          {state.progress.current} of {state.progress.total} songs processed.
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
          {state.shouldSaveToLibrary
            ? `${state.saveSummary?.saved ?? 0} saved to library`
            : `${state.saveSummary?.discarded ?? 0} discarded`}
        </Text>
        {savedIds.length > 0 ? (
          <Text style={[styles.pathText, { color: theme.mutedText }]}>
            Song ids: {savedIds.join(", ")}
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
