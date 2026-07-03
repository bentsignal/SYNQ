import { Pressable, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { CollectionSongRowActionState } from "../services/library-collection-song-mutation-service";

type LibraryCollectionSongRowActionsProps = {
  onMoveSong?: (direction: "down" | "up") => void;
  onRemoveSong?: () => void;
  rowState: CollectionSongRowActionState;
  songTitle: string;
};

export function LibraryCollectionSongRowActions({
  onMoveSong,
  onRemoveSong,
  rowState,
  songTitle,
}: LibraryCollectionSongRowActionsProps) {
  const theme = useCustomizationTheme();

  return (
    <>
      {onMoveSong ? (
        <View style={styles.reorderButtons}>
          <Pressable
            accessibilityLabel={`Move ${songTitle} up`}
            accessibilityRole="button"
            disabled={!rowState.canMoveUp}
            onPress={() => onMoveSong("up")}
            style={[
              styles.moveButton,
              { borderColor: theme.border },
              !rowState.canMoveUp ? styles.disabledButton : null,
            ]}
          >
            <Text style={[styles.moveText, { color: theme.accent }]}>
              {rowState.upLabel}
            </Text>
          </Pressable>
          <Pressable
            accessibilityLabel={`Move ${songTitle} down`}
            accessibilityRole="button"
            disabled={!rowState.canMoveDown}
            onPress={() => onMoveSong("down")}
            style={[
              styles.moveButton,
              { borderColor: theme.border },
              !rowState.canMoveDown ? styles.disabledButton : null,
            ]}
          >
            <Text style={[styles.moveText, { color: theme.accent }]}>
              {rowState.downLabel}
            </Text>
          </Pressable>
        </View>
      ) : null}
      {onRemoveSong ? (
        <Pressable
          accessibilityRole="button"
          disabled={!rowState.canRemove}
          onPress={onRemoveSong}
          style={[
            styles.removeButton,
            { borderColor: theme.border },
            !rowState.canRemove ? styles.disabledButton : null,
          ]}
        >
          <Text style={[styles.removeText, { color: theme.danger }]}>
            {rowState.removeLabel}
          </Text>
        </Pressable>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  disabledButton: {
    opacity: 0.55,
  },
  moveButton: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 34,
    minWidth: 54,
    paddingHorizontal: 8,
  },
  moveText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  removeButton: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 34,
    minWidth: 76,
    paddingHorizontal: 10,
  },
  removeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  reorderButtons: {
    flexDirection: "row",
    gap: 6,
  },
});
