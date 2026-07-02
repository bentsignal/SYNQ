import { StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

type AddCollectionSongsSectionHeaderProps = {
  updatedLabel: string;
};

export function AddCollectionSongsSectionHeader({
  updatedLabel,
}: AddCollectionSongsSectionHeaderProps) {
  const theme = useCustomizationTheme();

  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>
        Songs
      </Text>
      <Text style={[styles.sectionMeta, { color: theme.secondaryText }]}>
        {updatedLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  sectionTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 25,
  },
  sectionMeta: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 17,
    textAlign: "right",
    textTransform: "uppercase",
  },
});
