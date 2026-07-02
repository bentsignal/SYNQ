import { StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibrarySongDetail } from "../services/library-song-detail-service";

type LibrarySongDetailHeaderProps = {
  detail: LibrarySongDetail;
};

export function LibrarySongDetailHeader({ detail }: LibrarySongDetailHeaderProps) {
  const theme = useCustomizationTheme();

  return (
    <>
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: theme.accent }]}>Song</Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>
          {detail.title}
        </Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          {detail.relationshipSummary}
        </Text>
      </View>

      <View style={styles.summaryGrid}>
        <View
          style={[
            styles.summaryPanel,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.summaryValue, { color: theme.primaryText }]}>
            {detail.durationLabel}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.secondaryText }]}>
            Duration
          </Text>
        </View>
        <View
          style={[
            styles.summaryPanel,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.summaryValue, { color: theme.primaryText }]}>
            {detail.fileType}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.secondaryText }]}>
            File type
          </Text>
        </View>
      </View>
    </>
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
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  summaryPanel: {
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: "47%",
    flexGrow: 1,
    gap: 6,
    minHeight: 92,
    minWidth: 140,
    padding: 16,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 28,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
});
