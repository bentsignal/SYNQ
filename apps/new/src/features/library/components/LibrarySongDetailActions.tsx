import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibrarySongDetailActionState } from "../services/library-song-detail-service";
import { getLibrarySongEditHref } from "../services/library-song-interaction-service";

type LibrarySongDetailActionsProps = {
  actionState: LibrarySongDetailActionState;
  onDelete: () => void;
  onExport: () => void;
  onPlay: () => void;
  onQueue: () => void;
  onToggleLiked: () => void;
  songId: number;
};

export function LibrarySongDetailActions({
  actionState,
  onDelete,
  onExport,
  onPlay,
  onQueue,
  onToggleLiked,
  songId,
}: LibrarySongDetailActionsProps) {
  const theme = useCustomizationTheme();

  return (
    <View style={styles.actionRow}>
      <Pressable
        accessibilityRole="button"
        disabled={!actionState.canPlay}
        onPress={onPlay}
        style={[
          styles.primaryButton,
          { backgroundColor: theme.accent },
          !actionState.canPlay ? styles.disabled : null,
        ]}
      >
        <Text style={[styles.primaryButtonText, { color: theme.onAccent }]}>
          Play
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        disabled={!actionState.canPlay}
        onPress={onQueue}
        style={[
          styles.secondaryButton,
          { backgroundColor: theme.surface, borderColor: theme.border },
          !actionState.canPlay ? styles.disabled : null,
        ]}
      >
        <Text style={[styles.secondaryButtonText, { color: theme.accent }]}>
          Add to queue
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        disabled={!actionState.canToggleLiked}
        onPress={onToggleLiked}
        style={[
          styles.secondaryButton,
          { backgroundColor: theme.surface, borderColor: theme.border },
          !actionState.canToggleLiked ? styles.disabled : null,
        ]}
      >
        <Text style={[styles.secondaryButtonText, { color: theme.accent }]}>
          {actionState.likedLabel}
        </Text>
      </Pressable>
      <Link
        href={getLibrarySongEditHref({ songId })}
        style={[
          styles.secondaryButton,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            color: theme.accent,
          },
        ]}
      >
        Edit
      </Link>
      <Pressable
        accessibilityRole="button"
        disabled={!actionState.canExport}
        onPress={onExport}
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
        disabled={!actionState.canDelete}
        onPress={onDelete}
        style={[
          styles.dangerButton,
          { backgroundColor: theme.surface, borderColor: theme.danger },
          !actionState.canDelete ? styles.disabled : null,
        ]}
      >
        <Text style={[styles.secondaryButtonText, { color: theme.danger }]}>
          {actionState.deleteLabel}
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
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flexGrow: 1,
    justifyContent: "center",
    minHeight: 44,
    minWidth: 132,
    paddingHorizontal: 14,
  },
  dangerButton: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flexGrow: 1,
    justifyContent: "center",
    minHeight: 44,
    minWidth: 112,
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
});
