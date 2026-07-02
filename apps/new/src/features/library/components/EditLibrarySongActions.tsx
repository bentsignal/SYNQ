import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { getLibrarySongDetailHref } from "../services/library-song-detail-service";
import type { LibrarySongEditActionState } from "../services/library-song-form-service";

type EditLibrarySongActionsProps = {
  actionState: LibrarySongEditActionState;
  onSave: () => void;
  songId: number;
};

export function EditLibrarySongActions({
  actionState,
  onSave,
  songId,
}: EditLibrarySongActionsProps) {
  const theme = useCustomizationTheme();

  return (
    <View style={styles.actionRow}>
      <Pressable
        accessibilityRole="button"
        disabled={!actionState.canSave}
        onPress={onSave}
        style={[
          styles.primaryButton,
          { backgroundColor: theme.accent },
          !actionState.canSave ? styles.disabled : null,
        ]}
      >
        <Text style={[styles.primaryButtonText, { color: theme.onAccent }]}>
          {actionState.saveLabel}
        </Text>
      </Pressable>
      <Link
        href={getLibrarySongDetailHref({ songId })}
        style={[
          styles.secondaryButton,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            color: theme.accent,
          },
        ]}
      >
        Cancel
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
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
    minHeight: 44,
    minWidth: 112,
    paddingHorizontal: 14,
  },
  secondaryButton: {
    borderRadius: 8,
    borderWidth: 1,
    flexGrow: 1,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 42,
    minHeight: 44,
    minWidth: 112,
    overflow: "hidden",
    paddingHorizontal: 14,
    textAlign: "center",
    textTransform: "uppercase",
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
});
