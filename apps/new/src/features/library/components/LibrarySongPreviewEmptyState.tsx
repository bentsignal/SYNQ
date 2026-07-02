import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

export function LibrarySongPreviewEmptyState() {
  const theme = useCustomizationTheme();

  return (
    <View
      style={[
        styles.emptyPanel,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <Text style={[styles.emptyTitle, { color: theme.primaryText }]}>
        No songs yet
      </Text>
      <Text style={[styles.emptyBody, { color: theme.secondaryText }]}>
        Import audio files to start building your song library.
      </Text>
      <Link
        href="/(tabs)/import"
        style={[styles.emptyLink, { color: theme.accent }]}
      >
        Import music
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyPanel: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 21,
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyLink: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
});
