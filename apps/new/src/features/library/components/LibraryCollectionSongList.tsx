import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibraryCollectionDetailSong } from "../hooks/use-library-collection-detail-query";

type LibraryCollectionSongListProps = {
  movingSongId?: number | null;
  onMoveSong?: (songId: number, direction: "down" | "up") => void;
  onRemoveSong?: (songId: number) => void;
  removingSongId?: number | null;
  songs: LibraryCollectionDetailSong[];
};

const formatDuration = (duration: number | null) => {
  if (!duration) {
    return "--:--";
  }

  const totalSeconds = Math.round(duration / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export function LibraryCollectionSongList({
  movingSongId,
  onMoveSong,
  onRemoveSong,
  removingSongId,
  songs,
}: LibraryCollectionSongListProps) {
  const theme = useCustomizationTheme();
  const isMutating = movingSongId !== null || removingSongId !== null;

  if (songs.length === 0) {
    return (
      <View
        style={[
          styles.emptyPanel,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.emptyTitle, { color: theme.primaryText }]}>
          No songs here yet
        </Text>
        <Text style={[styles.emptyBody, { color: theme.secondaryText }]}>
          This detail view is live and will update when matching songs are added
          to the shared library database.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.list,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      {songs.map((song, index) => (
        <View
          key={song.id}
          style={[styles.row, { borderBottomColor: theme.borderSubtle }]}
        >
          <Link asChild href={`/(tabs)/library/song/${song.id}`}>
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
                {formatDuration(song.duration)}
              </Text>
            </Pressable>
          </Link>
          {onMoveSong ? (
            <View style={styles.reorderButtons}>
              <Pressable
                accessibilityLabel={`Move ${song.title} up`}
                accessibilityRole="button"
                disabled={index === 0 || isMutating}
                onPress={() => onMoveSong(song.id, "up")}
                style={[
                  styles.moveButton,
                  { borderColor: theme.border },
                  index === 0 || isMutating ? styles.disabledButton : null,
                ]}
              >
                <Text style={[styles.moveText, { color: theme.accent }]}>
                  Up
                </Text>
              </Pressable>
              <Pressable
                accessibilityLabel={`Move ${song.title} down`}
                accessibilityRole="button"
                disabled={index === songs.length - 1 || isMutating}
                onPress={() => onMoveSong(song.id, "down")}
                style={[
                  styles.moveButton,
                  { borderColor: theme.border },
                  index === songs.length - 1 || isMutating
                    ? styles.disabledButton
                    : null,
                ]}
              >
                <Text style={[styles.moveText, { color: theme.accent }]}>
                  Down
                </Text>
              </Pressable>
            </View>
          ) : null}
          {onRemoveSong ? (
            <Pressable
              accessibilityRole="button"
              disabled={isMutating}
              onPress={() => onRemoveSong(song.id)}
              style={[
                styles.removeButton,
                { borderColor: theme.border },
                isMutating ? styles.disabledButton : null,
              ]}
            >
              <Text style={[styles.removeText, { color: theme.danger }]}>
                {removingSongId === song.id ? "Removing" : "Remove"}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyPanel: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 21,
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  list: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
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
  track: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    minWidth: 24,
    textAlign: "right",
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
  meta: {
    fontSize: 13,
    lineHeight: 18,
  },
  duration: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    minWidth: 44,
    textAlign: "right",
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
  reorderButtons: {
    flexDirection: "row",
    gap: 6,
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
  disabledButton: {
    opacity: 0.55,
  },
  moveText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  removeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
});
