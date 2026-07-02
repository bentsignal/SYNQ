import { Link, router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { ImportPremiumGate } from "../components/ImportPremiumGate";
import { ImportSongPreviewList } from "../components/ImportSongPreviewList";
import { useImportSession } from "../hooks/use-import-session";
import { getImportFilesActionState } from "../services/import-session-state-service";

export function ImportFilesScreen() {
  const { removeImportSongs, startFileImport, state } = useImportSession();
  const theme = useCustomizationTheme();
  const { sendHaptic } = useHapticFeedback();
  const { canChooseFiles, chooseLabel } = getImportFilesActionState(state);

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.scroll, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: theme.accent }]}>
          Import files
        </Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>Files</Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          Stage songs here before choosing whether to save them.
        </Text>
      </View>

      <ImportPremiumGate>
        <Pressable
          accessibilityRole="button"
          disabled={!canChooseFiles}
          onPress={async () => {
            sendHaptic("light");
            const staged = await startFileImport();
            sendHaptic(staged ? "success" : "error");
            router.push(staged ? "/(tabs)/import/save" : "/(tabs)/import/failure");
          }}
          style={[
            styles.primaryButton,
            { backgroundColor: theme.accent },
            !canChooseFiles ? styles.disabled : null,
          ]}
        >
          <Text style={[styles.primaryButtonText, { color: theme.onAccent }]}>
            {chooseLabel}
          </Text>
        </Pressable>
      </ImportPremiumGate>

      <ImportSongPreviewList
        canEditSongs
        onRemoveSong={async (songId) => {
          sendHaptic("medium");
          const removed = await removeImportSongs([songId]);
          sendHaptic(removed ? "success" : "error");
        }}
        songs={state.songs}
      />

      <View style={styles.actionRow}>
        <Link
          href="/(tabs)/import/save"
          style={[styles.backLink, { color: theme.accent }]}
        >
          Review save
        </Link>
        <Link href="/(tabs)/import" style={[styles.backLink, { color: theme.accent }]}>
          Back to import
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
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
  primaryButton: {
    alignItems: "center",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  disabled: {
    opacity: 0.5,
  },
  actionRow: {
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
