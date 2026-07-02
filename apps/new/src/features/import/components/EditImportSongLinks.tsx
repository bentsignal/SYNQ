import { Link } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

export function EditImportSongLinks() {
  const theme = useCustomizationTheme();

  return (
    <View style={styles.linkRow}>
      <Link
        href="/(tabs)/import/save"
        style={[styles.backLink, { color: theme.accent }]}
      >
        Back to save
      </Link>
      <Link
        href="/(tabs)/import/files"
        style={[styles.backLink, { color: theme.accent }]}
      >
        Back to files
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  linkRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  backLink: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
