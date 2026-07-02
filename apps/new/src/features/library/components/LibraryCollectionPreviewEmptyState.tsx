import { StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { getLibraryCollectionPreviewEmptyState } from "../services/library-collection-preview-service";

export function LibraryCollectionPreviewEmptyState() {
  const theme = useCustomizationTheme();
  const emptyState = getLibraryCollectionPreviewEmptyState();

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
});
