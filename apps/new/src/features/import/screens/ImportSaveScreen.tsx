import { Link, router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ImportPremiumGate } from "../components/ImportPremiumGate";
import { ImportSongPreviewList } from "../components/ImportSongPreviewList";
import { useImportSession } from "../hooks/use-import-session";

export function ImportSaveScreen() {
  const { discardSession, saveImportSession, setShouldSaveToLibrary, state } =
    useImportSession();
  const canFinish = state.songs.length > 0;
  const isWorking = state.phase === "saving" || state.phase === "discarding";

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Import review</Text>
        <Text style={styles.title}>Save</Text>
        <Text style={styles.subtitle}>
          Review staged songs before writing them to the library.
        </Text>
      </View>

      <ImportPremiumGate>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: state.shouldSaveToLibrary }}
          onPress={() => setShouldSaveToLibrary(!state.shouldSaveToLibrary)}
          style={styles.toggleRow}
        >
          <View
            style={[
              styles.toggleBox,
              state.shouldSaveToLibrary ? styles.toggleBoxActive : null,
            ]}
          />
          <Text style={styles.toggleText}>Save to library</Text>
        </Pressable>

        <ImportSongPreviewList canEditSongs songs={state.songs} />

        <View style={styles.actionRow}>
          <Pressable
            accessibilityRole="button"
            disabled={!canFinish || isWorking}
            onPress={async () => {
              const succeeded = await saveImportSession();
              router.push(succeeded ? "/import/success" : "/import/failure");
            }}
            style={[
              styles.primaryButton,
              !canFinish || isWorking ? styles.disabled : null,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {isWorking ? "Finishing" : "Finish"}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={isWorking}
            onPress={() => {
              discardSession();
              router.push("/import");
            }}
            style={[styles.secondaryButton, isWorking ? styles.disabled : null]}
          >
            <Text style={styles.secondaryButtonText}>Discard</Text>
          </Pressable>
        </View>
      </ImportPremiumGate>

      <Link href="/import/files" style={styles.backLink}>
        Back to files
      </Link>
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
  toggleRow: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  toggleBox: {
    borderColor: "#9aa6a0",
    borderRadius: 6,
    borderWidth: 2,
    height: 22,
    width: 22,
  },
  toggleBoxActive: {
    backgroundColor: "#0f766e",
    borderColor: "#0f766e",
  },
  toggleText: {
    color: "#121417",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#0f766e",
    borderRadius: 8,
    flexGrow: 1,
    justifyContent: "center",
    minHeight: 46,
    minWidth: 110,
    paddingHorizontal: 14,
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    flexGrow: 1,
    justifyContent: "center",
    minHeight: 46,
    minWidth: 110,
    paddingHorizontal: 14,
  },
  disabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  secondaryButtonText: {
    color: "#b42318",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  backLink: {
    color: "#0f766e",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
