import { Link } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import {
  getImportSongEditFilesHref,
  getImportSongEditSaveHref,
} from "../services/import-song-form-service";

export function EditImportSongLinks() {
  const theme = useCustomizationTheme();
  const saveHref = getImportSongEditSaveHref();
  const filesHref = getImportSongEditFilesHref();

  return (
    <View style={styles.linkRow}>
      <Link
        href={saveHref}
        style={[styles.backLink, { color: theme.accent }]}
      >
        Back to save
      </Link>
      <Link
        href={filesHref}
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
