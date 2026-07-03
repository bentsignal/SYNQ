import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { ImportFilesController } from "../hooks/use-import-files-controller";
import { getImportFilesActionLinks } from "../services/import-files-screen-state-service";
import { ImportPremiumGate } from "./ImportPremiumGate";
import { ImportSongPreviewList } from "./ImportSongPreviewList";

type ImportFilesScreenViewProps = ImportFilesController;

export function ImportFilesScreenView({
  actionState,
  chooseFiles,
  removeSong,
  state,
}: ImportFilesScreenViewProps) {
  const theme = useCustomizationTheme();
  const actionLinks = getImportFilesActionLinks();

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
          disabled={!actionState.canChooseFiles}
          onPress={chooseFiles}
          style={[
            styles.primaryButton,
            { backgroundColor: theme.accent },
            !actionState.canChooseFiles ? styles.disabled : null,
          ]}
        >
          <Text style={[styles.primaryButtonText, { color: theme.onAccent }]}>
            {actionState.chooseLabel}
          </Text>
        </Pressable>
      </ImportPremiumGate>

      <ImportSongPreviewList
        canEditSongs
        onRemoveSong={removeSong}
        songs={state.songs}
      />

      <View style={styles.actionRow}>
        {actionLinks.map((link) => (
          <Link
            href={link.href}
            key={link.href}
            style={[styles.backLink, { color: theme.accent }]}
          >
            {link.label}
          </Link>
        ))}
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
