import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import {
  getImportSongEditFilesHref,
  getImportSongEditSaveHref,
} from "../services/import-song-form-service";

type EditImportSongInvalidStateProps = {
  reason: "invalid-id" | "not-staged";
};

export function EditImportSongInvalidState({
  reason,
}: EditImportSongInvalidStateProps) {
  const theme = useCustomizationTheme();
  const isInvalidId = reason === "invalid-id";
  const saveHref = getImportSongEditSaveHref();
  const filesHref = getImportSongEditFilesHref();

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <Text style={[styles.kicker, { color: theme.accent }]}>Import edit</Text>
      <Text style={[styles.title, { color: theme.primaryText }]}>
        {isInvalidId ? "Invalid song" : "Song not staged"}
      </Text>
      <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
        {isInvalidId
          ? "This route needs a numeric id."
          : "Choose songs again or return to the current review."}
      </Text>
      {isInvalidId ? (
        <Link
          href={saveHref}
          style={[styles.backLink, { color: theme.accent }]}
        >
          Back to save
        </Link>
      ) : (
        <View style={styles.linkRow}>
          <Link
            href={filesHref}
            style={[styles.backLink, { color: theme.accent }]}
          >
            Back to files
          </Link>
          <Link
            href={saveHref}
            style={[styles.backLink, { color: theme.accent }]}
          >
            Back to save
          </Link>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 56,
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
