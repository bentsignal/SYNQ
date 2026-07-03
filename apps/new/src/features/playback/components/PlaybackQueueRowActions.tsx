import { Pressable, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { PlaybackQueueRowPresentation } from "../services/playback-queue-row-service";

type PlaybackQueueRowActionsProps = {
  onMoveSong: (direction: "down" | "up") => void;
  onRemoveSong: () => void;
  rowState: PlaybackQueueRowPresentation;
};

export function PlaybackQueueRowActions({
  onMoveSong,
  onRemoveSong,
  rowState,
}: PlaybackQueueRowActionsProps) {
  const theme = useCustomizationTheme();

  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={onRemoveSong}
        style={[styles.removeButton, { borderColor: theme.border }]}
      >
        <Text style={[styles.removeText, { color: theme.danger }]}>
          {rowState.removeLabel}
        </Text>
      </Pressable>
      <View style={styles.moveButtons}>
        <Pressable
          accessibilityLabel={rowState.moveUpAccessibilityLabel}
          accessibilityRole="button"
          disabled={!rowState.canMoveUp}
          onPress={() => onMoveSong("up")}
          style={[
            styles.moveButton,
            { borderColor: theme.border },
            !rowState.canMoveUp ? styles.disabled : null,
          ]}
        >
          <Text style={[styles.moveText, { color: theme.accent }]}>
            {rowState.moveUpLabel}
          </Text>
        </Pressable>
        <Pressable
          accessibilityLabel={rowState.moveDownAccessibilityLabel}
          accessibilityRole="button"
          disabled={!rowState.canMoveDown}
          onPress={() => onMoveSong("down")}
          style={[
            styles.moveButton,
            { borderColor: theme.border },
            !rowState.canMoveDown ? styles.disabled : null,
          ]}
        >
          <Text style={[styles.moveText, { color: theme.accent }]}>
            {rowState.moveDownLabel}
          </Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.45,
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
  moveButtons: {
    flexDirection: "row",
    gap: 6,
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
});
