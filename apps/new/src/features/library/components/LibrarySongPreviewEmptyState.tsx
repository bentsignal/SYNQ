import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { getLibrarySongPreviewEmptyState } from "../services/library-song-preview-service";

export function LibrarySongPreviewEmptyState() {
  const theme = useCustomizationTheme();
  const emptyState = getLibrarySongPreviewEmptyState();

  return (
    <View
      style={[
        styles.emptyPanel,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <Text style={[styles.emptyTitle, { color: theme.primaryText }]}>
        {emptyState.title}
      </Text>
      <Text style={[styles.emptyBody, { color: theme.secondaryText }]}>
        {emptyState.body}
      </Text>
      <Link
        href={emptyState.link.href}
        style={[styles.emptyLink, { color: theme.accent }]}
      >
        {emptyState.link.label}
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
