import { Link } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { getImportSongEditBackLinks } from "../services/import-song-edit-navigation-service";

export function EditImportSongLinks() {
  const theme = useCustomizationTheme();
  const links = getImportSongEditBackLinks();

  return (
    <View style={styles.linkRow}>
      {links.map((link) => (
        <Link
          href={link.href}
          key={link.href}
          style={[styles.backLink, { color: theme.accent }]}
        >
          {link.label}
        </Link>
      ))}
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
