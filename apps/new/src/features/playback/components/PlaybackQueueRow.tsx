import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatDurationMs } from "@/src/features/app-shell/services/duration-format-service";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { getPlaybackQueueRowState } from "../services/playback-queue-service";
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
  const { canMoveDown, canMoveUp, canPlay, isActive } =
    getPlaybackQueueRowState({
      activeTrackId,
      adBreakActive,
      index,
      queueLength,
      songId: song.id,
    });

  return (
    <View style={[styles.row, { borderBottomColor: theme.borderSubtle }]}>
      <Pressable
        accessibilityRole="button"
        disabled={!canPlay}
        onPress={() => onPlaySong(song)}
        style={[styles.rowMain, !canPlay ? styles.disabled : null]}
      >
        <Text
          style={[
            isActive ? styles.activeIndex : styles.index,
            { color: isActive ? theme.accent : theme.mutedText },
          ]}
        >
          {index + 1}
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
            {song.artist} / {song.album}
          </Text>
        </View>
        <Text style={[styles.duration, { color: theme.primaryText }]}>
          {formatDurationMs(song.duration)}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => onRemoveSong(song.id)}
        style={[styles.removeButton, { borderColor: theme.border }]}
      >
        <Text style={[styles.removeText, { color: theme.danger }]}>
          Remove
        </Text>
      </Pressable>
      <View style={styles.moveButtons}>
        <Pressable
          accessibilityLabel={`Move ${song.title} up`}
          accessibilityRole="button"
          disabled={!canMoveUp}
          onPress={() => onMoveSong(song.id, "up")}
          style={[
            styles.moveButton,
            { borderColor: theme.border },
            !canMoveUp ? styles.disabled : null,
          ]}
        >
          <Text style={[styles.moveText, { color: theme.accent }]}>Up</Text>
        </Pressable>
        <Pressable
          accessibilityLabel={`Move ${song.title} down`}
          accessibilityRole="button"
          disabled={!canMoveDown}
          onPress={() => onMoveSong(song.id, "down")}
          style={[
            styles.moveButton,
            { borderColor: theme.border },
            !canMoveDown ? styles.disabled : null,
          ]}
        >
          <Text style={[styles.moveText, { color: theme.accent }]}>Down</Text>
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
