import { StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

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
  const theme = useCustomizationTheme();

  return (
    <View style={styles.grid}>
      {summaryItems.map((item) => (
        <View
          key={item.key}
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.count, { color: theme.primaryText }]}>
            {counts[item.key]}
          </Text>
          <Text style={[styles.label, { color: theme.secondaryText }]}>
            {item.label}
          </Text>
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
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 36,
  },
  label: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
});
