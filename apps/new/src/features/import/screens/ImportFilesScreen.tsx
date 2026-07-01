import { Link, router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ImportSongPreviewList } from "../components/ImportSongPreviewList";
import { useImportSession } from "../hooks/use-import-session";

const unavailableFilePickerMessage =
  "File selection is ready for native picker integration.";

export function ImportFilesScreen() {
  const { beginFilePick, failSession, removeImportSongs, state } =
    useImportSession();

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Import files</Text>
        <Text style={styles.title}>Files</Text>
        <Text style={styles.subtitle}>
          Stage songs here before choosing whether to save them.
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => {
          beginFilePick();
          failSession(unavailableFilePickerMessage);
          router.push("/import/failure");
        }}
        style={styles.primaryButton}
      >
        <Text style={styles.primaryButtonText}>Choose songs</Text>
      </Pressable>

      <ImportSongPreviewList
        onRemoveSong={(songId) => removeImportSongs([songId])}
        songs={state.songs}
      />

      <View style={styles.actionRow}>
        <Link href="/import/save" style={styles.backLink}>
          Review save
        </Link>
        <Link href="/import" style={styles.backLink}>
          Back to import
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: "#f4f7f5",
    flex: 1,
  },
  content: {
    gap: 20,
    paddingHorizontal: 20,
    paddingVertical: 56,
  },
  header: {
    gap: 8,
  },
  kicker: {
    color: "#0f766e",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    color: "#121417",
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 40,
  },
  subtitle: {
    color: "#52605a",
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 520,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#0f766e",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  backLink: {
    color: "#0f766e",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
