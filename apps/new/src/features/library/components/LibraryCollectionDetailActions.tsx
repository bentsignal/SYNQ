import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibraryCollectionDetail } from "../services/library-collection-detail-service";
import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";
import {
  type CollectionDetailActionState,
} from "../services/library-collection-interaction-service";
import {
  getCollectionAddSongsHref,
  getCollectionEditHref,
} from "../services/library-collection-navigation-service";

type LibraryCollectionDetailActionsProps = {
  actionState: CollectionDetailActionState;
  detail: LibraryCollectionDetail;
  id: number;
  kind: LibraryCollectionDetailKind;
  onDelete: () => void;
  onExport: () => void;
  onPlay: () => void;
  onQueue: () => void;
};

export function LibraryCollectionDetailActions({
  actionState,
  detail,
  id,
  kind,
  onDelete,
  onExport,
  onPlay,
  onQueue,
}: LibraryCollectionDetailActionsProps) {
  const theme = useCustomizationTheme();
  const editHref = getCollectionEditHref({ id, kind });
  const addHref = getCollectionAddSongsHref({ id, kind });

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
        disabled={!actionState.canQueue}
        onPress={onQueue}
        style={[
          styles.secondaryButton,
          { backgroundColor: theme.surface, borderColor: theme.border },
          !actionState.canQueue ? styles.disabled : null,
        ]}
      >
        <Text style={[styles.secondaryButtonText, { color: theme.accent }]}>
          Add to queue
        </Text>
      </Pressable>
      <Link
        href={editHref}
        style={[styles.editLink, { color: theme.accent }]}
      >
        Edit {detail.eyebrow.toLowerCase()}
      </Link>
      <Link
        href={addHref}
        style={[styles.editLink, { color: theme.accent }]}
      >
        Add songs
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
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  primaryButton: {
    alignItems: "center",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 44,
    minWidth: 112,
    paddingHorizontal: 16,
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
    justifyContent: "center",
    minHeight: 44,
    minWidth: 132,
    paddingHorizontal: 16,
  },
  dangerButton: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
    minWidth: 132,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  disabled: {
    opacity: 0.45,
  },
  editLink: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
});
