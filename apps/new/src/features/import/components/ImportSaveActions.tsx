import { Pressable, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { ImportSaveActionState } from "../services/import-screen-state-service";

type ImportSaveActionsProps = {
  actionState: ImportSaveActionState;
  discardImport: () => void;
  exportSongs: () => void;
  finishImport: () => void;
};

export function ImportSaveActions({
  actionState,
  discardImport,
  exportSongs,
  finishImport,
}: ImportSaveActionsProps) {
  const theme = useCustomizationTheme();

  return (
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
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  disabled: {
    opacity: 0.45,
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
  primaryButtonText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
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
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
});
