import { StyleSheet, Text, View } from "react-native";
import { useLibrarySummaryQuery } from "../hooks/use-library-summary-query";

const summaryItems = [
  {
    key: "songs",
    label: "Songs",
  },
  {
    key: "playlists",
    label: "Playlists",
  },
  {
    key: "albums",
    label: "Albums",
  },
  {
    key: "artists",
    label: "Artists",
  },
] as const;

export function LibraryHomeScreen() {
  const { counts, errors, updatedAt } = useLibrarySummaryQuery();
  const hasErrors = errors.length > 0;
  const updatedLabel =
    updatedAt > 0
      ? `Updated ${new Date(updatedAt).toLocaleTimeString()}`
      : "Waiting for library data";

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.kicker}>src/features/library</Text>
        <Text style={styles.title}>Library</Text>
        <Text style={styles.subtitle}>
          Reactive Drizzle summary wired to the shared SYNQ database.
        </Text>
      </View>

      <View style={styles.grid}>
        {summaryItems.map((item) => (
          <View key={item.key} style={styles.card}>
            <Text style={styles.count}>{counts[item.key]}</Text>
            <Text style={styles.label}>{item.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.panel}>
        <Text style={hasErrors ? styles.errorText : styles.panelText}>
          {hasErrors
            ? "One or more library summary queries failed."
            : updatedLabel}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#f4f7f5",
    flex: 1,
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: "47%",
    flexGrow: 1,
    gap: 6,
    minHeight: 96,
    minWidth: 140,
    padding: 16,
  },
  count: {
    color: "#121417",
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 36,
  },
  label: {
    color: "#52605a",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
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
