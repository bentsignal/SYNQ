import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatDurationMs } from "@/src/features/app-shell/services/duration-format-service";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibraryCollectionDetailSong } from "../hooks/use-library-collection-detail-query";
import { getCollectionSongRowActionState } from "../services/library-collection-song-mutation-service";
import { getLibrarySongDetailHref } from "../services/library-song-interaction-service";

type LibraryCollectionSongRowProps = {
  index: number;
  movingSongId?: number | null;
  onMoveSong?: (songId: number, direction: "down" | "up") => void;
  onRemoveSong?: (songId: number) => void;
  removingSongId?: number | null;
  song: LibraryCollectionDetailSong;
  totalSongs: number;
};

export function LibraryCollectionSongRow({
  index,
  movingSongId,
  onMoveSong,
  onRemoveSong,
  removingSongId,
  song,
  totalSongs,
}: LibraryCollectionSongRowProps) {
  const theme = useCustomizationTheme();
  const rowState = getCollectionSongRowActionState({
    index,
    movingSongId: movingSongId ?? null,
    removingSongId: removingSongId ?? null,
    songId: song.id,
    totalSongs,
  });

  return (
    <View style={[styles.row, { borderBottomColor: theme.borderSubtle }]}>
      <Link asChild href={getLibrarySongDetailHref({ songId: song.id })}>
        <Pressable style={styles.rowLink}>
          <Text style={[styles.track, { color: theme.mutedText }]}>
            {song.track !== null ? song.track.toString() : ""}
          </Text>
          <View style={styles.rowText}>
            <Text
              numberOfLines={1}
              style={[styles.title, { color: theme.primaryText }]}
            >
              {song.title}
            </Text>
            <Text
              numberOfLines={1}
              style={[styles.meta, { color: theme.secondaryText }]}
            >
              {song.artist} / {song.album}
            </Text>
          </View>
          <Text style={[styles.duration, { color: theme.primaryText }]}>
            {formatDurationMs(song.duration)}
          </Text>
        </Pressable>
      </Link>
      {onMoveSong ? (
        <View style={styles.reorderButtons}>
          <Pressable
            accessibilityLabel={`Move ${song.title} up`}
            accessibilityRole="button"
            disabled={!rowState.canMoveUp}
            onPress={() => onMoveSong(song.id, "up")}
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
            accessibilityLabel={`Move ${song.title} down`}
            accessibilityRole="button"
            disabled={!rowState.canMoveDown}
            onPress={() => onMoveSong(song.id, "down")}
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
          onPress={() => onRemoveSong(song.id)}
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
    </View>
  );
}

const styles = StyleSheet.create({
  disabledButton: {
    opacity: 0.55,
  },
  duration: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    minWidth: 44,
    textAlign: "right",
  },
  meta: {
    fontSize: 13,
    lineHeight: 18,
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
  row: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 66,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  rowLink: {
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
  title: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 20,
  },
  track: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    minWidth: 24,
    textAlign: "right",
  },
});
