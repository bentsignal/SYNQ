import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { ImportSaveController } from "../hooks/use-import-save-controller";
import type { ImportSessionState } from "../types/import-session";
import { ImportPremiumGate } from "./ImportPremiumGate";
import { ImportSongPreviewList } from "./ImportSongPreviewList";

type ImportSaveScreenViewProps = ImportSaveController & {
  state: ImportSessionState;
};

export function ImportSaveScreenView({
  actionState,
  discardImport,
  exportError,
  exportSongs,
  finishImport,
  state,
  toggleShouldSaveToLibrary,
}: ImportSaveScreenViewProps) {
  const theme = useCustomizationTheme();

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.scroll, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: theme.accent }]}>
          Import review
        </Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>Save</Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          Review staged songs before writing them to the library.
        </Text>
      </View>

      <ImportPremiumGate>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: state.shouldSaveToLibrary }}
          onPress={toggleShouldSaveToLibrary}
          style={[
            styles.toggleRow,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View
            style={[
              styles.toggleBox,
              { borderColor: theme.inactive },
              state.shouldSaveToLibrary
                ? {
                    backgroundColor: theme.accent,
                    borderColor: theme.accent,
                  }
                : null,
            ]}
          />
          <Text style={[styles.toggleText, { color: theme.primaryText }]}>
            Save to library
          </Text>
        </Pressable>

        <ImportSongPreviewList canEditSongs songs={state.songs} />

        <View style={styles.actionRow}>
          <Pressable
            accessibilityRole="button"
            disabled={!actionState.canExport}
            onPress={exportSongs}
            style={[
              styles.secondaryButton,
              { backgroundColor: theme.surface, borderColor: theme.border },
              !actionState.canExport ? styles.disabled : null,
            ]}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.accent }]}>
              {actionState.exportLabel}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={!actionState.canFinish}
            onPress={finishImport}
            style={[
              styles.primaryButton,
              { backgroundColor: theme.accent },
              !actionState.canFinish ? styles.disabled : null,
            ]}
          >
            <Text style={[styles.primaryButtonText, { color: theme.onAccent }]}>
              {actionState.finishLabel}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={!actionState.canDiscard}
            onPress={discardImport}
            style={[
              styles.secondaryButton,
              { backgroundColor: theme.surface, borderColor: theme.border },
              !actionState.canDiscard ? styles.disabled : null,
            ]}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.danger }]}>
              {actionState.discardLabel}
            </Text>
          </Pressable>
        </View>

        {exportError ? (
          <View
            style={[
              styles.errorPanel,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.errorText, { color: theme.danger }]}>
              {exportError}
            </Text>
          </View>
        ) : null}
      </ImportPremiumGate>

      <Link
        href="/(tabs)/import/files"
        style={[styles.backLink, { color: theme.accent }]}
      >
        Back to files
      </Link>
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
  toggleRow: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  toggleBox: {
    borderRadius: 6,
    borderWidth: 2,
    height: 22,
    width: 22,
  },
  toggleText: {
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
    borderRadius: 8,
    flexGrow: 1,
    justifyContent: "center",
    minHeight: 46,
    minWidth: 110,
    paddingHorizontal: 14,
  },
  secondaryButton: {
    alignItems: "center",
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
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  backLink: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
  errorPanel: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
});
