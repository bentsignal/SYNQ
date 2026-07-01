import { ScrollView, StyleSheet, Text, View } from "react-native";
import { LibrarySongPreviewList } from "../components/LibrarySongPreviewList";
import { LibrarySummaryGrid } from "../components/LibrarySummaryGrid";
import { useLibrarySongPreviewQuery } from "../hooks/use-library-song-preview-query";
import { useLibrarySummaryQuery } from "../hooks/use-library-summary-query";

export function LibraryHomeScreen() {
  const summary = useLibrarySummaryQuery();
  const songPreview = useLibrarySongPreviewQuery();
  const hasErrors = summary.errors.length > 0 || Boolean(songPreview.error);
  const updatedLabel =
    summary.updatedAt > 0
      ? `Updated ${new Date(summary.updatedAt).toLocaleTimeString()}`
      : "Waiting for library data";

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.kicker}>src/features/library</Text>
        <Text style={styles.title}>Library</Text>
        <Text style={styles.subtitle}>
          Reactive Drizzle library surface wired to the shared SYNQ database.
        </Text>
      </View>

      <LibrarySummaryGrid counts={summary.counts} />

      <LibrarySongPreviewList
        isEmpty={songPreview.isEmpty}
        songs={songPreview.songs}
      />

      <View style={styles.panel}>
        <Text style={hasErrors ? styles.errorText : styles.panelText}>
          {hasErrors
            ? "One or more library queries failed."
            : updatedLabel}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#f4f7f5",
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
    color: "#0f766e",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    color: "#121417",
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 40,
  },
  subtitle: {
    color: "#52605a",
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 460,
  },
  panel: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  panelText: {
    color: "#52605a",
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    color: "#b42318",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
});
