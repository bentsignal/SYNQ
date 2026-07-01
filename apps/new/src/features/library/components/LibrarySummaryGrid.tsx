import { StyleSheet, Text, View } from "react-native";

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

type LibrarySummaryCounts = Record<(typeof summaryItems)[number]["key"], number>;

type LibrarySummaryGridProps = {
  counts: LibrarySummaryCounts;
};

export function LibrarySummaryGrid({ counts }: LibrarySummaryGridProps) {
  return (
    <View style={styles.grid}>
      {summaryItems.map((item) => (
        <View key={item.key} style={styles.card}>
          <Text style={styles.count}>{counts[item.key]}</Text>
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
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
});
