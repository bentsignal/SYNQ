import { StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

export function ImportSongPreviewEmptyState() {
  const theme = useCustomizationTheme();

  return (
    <View
      style={[
        styles.emptyPanel,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <Text style={[styles.emptyTitle, { color: theme.primaryText }]}>
        No songs staged
      </Text>
      <Text style={[styles.emptyBody, { color: theme.secondaryText }]}>
        Choose songs to review them before saving.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyBody: {
    fontSize: 14,
    lineHeight: 20,
  },
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
});
