import { Pressable, StyleSheet, Text } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { ImportSongEditActionState } from "../services/import-song-form-service";

type EditImportSongActionsProps = {
  actionState: ImportSongEditActionState;
  error: string | null;
  onSave: () => void;
};

export function EditImportSongActions({
  actionState,
  error,
  onSave,
}: EditImportSongActionsProps) {
  const theme = useCustomizationTheme();

  return (
    <>
      {error ? (
        <Text style={[styles.errorText, { color: theme.danger }]}>
          {error}
        </Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        disabled={!actionState.canSave}
        onPress={onSave}
        style={[
          styles.saveButton,
          { backgroundColor: theme.accent },
          !actionState.canSave ? styles.disabledButton : null,
        ]}
      >
        <Text style={[styles.saveButtonText, { color: theme.onAccent }]}>
          Save song
        </Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  errorText: {
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
  },
  saveButton: {
    alignItems: "center",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 14,
  },
  disabledButton: {
    opacity: 0.45,
  },
  saveButtonText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
});
