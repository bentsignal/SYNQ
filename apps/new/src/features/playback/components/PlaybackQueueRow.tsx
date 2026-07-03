import { Pressable, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { getPlaybackQueueRowPresentation } from "../services/playback-queue-row-service";
import type { PlaybackQueueItem } from "../types/playback-state";

type PlaybackQueueRowProps = {
  activeTrackId: number | null;
  adBreakActive: boolean;
  index: number;
  onMoveSong: (songId: number, direction: "down" | "up") => void;
  onPlaySong: (song: PlaybackQueueItem) => void;
  onRemoveSong: (songId: number) => void;
  queueLength: number;
  song: PlaybackQueueItem;
};

export function PlaybackQueueRow({
  activeTrackId,
  adBreakActive,
  index,
  onMoveSong,
  onPlaySong,
  onRemoveSong,
  queueLength,
  song,
}: PlaybackQueueRowProps) {
  const theme = useCustomizationTheme();
  const rowState = getPlaybackQueueRowPresentation({
    activeTrackId,
    adBreakActive,
    index,
    queueLength,
    song,
  });

  return (
    <View style={[styles.row, { borderBottomColor: theme.borderSubtle }]}>
      <Pressable
        accessibilityRole="button"
        disabled={!rowState.canPlay}
        onPress={() => onPlaySong(song)}
        style={[styles.rowMain, !rowState.canPlay ? styles.disabled : null]}
      >
        <Text
          style={[
            rowState.isActive ? styles.activeIndex : styles.index,
            { color: rowState.isActive ? theme.accent : theme.mutedText },
          ]}
        >
          {rowState.indexLabel}
        </Text>
        <View style={styles.rowText}>
          <Text
            numberOfLines={1}
            style={[styles.songTitle, { color: theme.primaryText }]}
          >
            {song.title}
          </Text>
          <Text
            numberOfLines={1}
            style={[styles.songMeta, { color: theme.secondaryText }]}
          >
            {rowState.metadataLabel}
          </Text>
        </View>
        <Text style={[styles.duration, { color: theme.primaryText }]}>
          {rowState.durationLabel}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => onRemoveSong(song.id)}
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
          onPress={() => onMoveSong(song.id, "up")}
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
          onPress={() => onMoveSong(song.id, "down")}
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
    </View>
  );
}

const styles = StyleSheet.create({
  activeIndex: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    minWidth: 22,
    textAlign: "right",
  },
  disabled: {
    opacity: 0.45,
  },
  duration: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    minWidth: 44,
    textAlign: "right",
  },
  index: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    minWidth: 22,
    textAlign: "right",
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
  row: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 68,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  rowMain: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 12,
    minWidth: 0,
  },
  rowText: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  songMeta: {
    fontSize: 13,
    lineHeight: 18,
  },
  songTitle: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 20,
  },
});
