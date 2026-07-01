import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ImportSongDraft } from "../types/import-session";

type ImportSongPreviewListProps = {
  onRemoveSong?: (songId: number) => void;
  songs: ImportSongDraft[];
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

export function ImportSongPreviewList({
  onRemoveSong,
  songs,
}: ImportSongPreviewListProps) {
  if (songs.length === 0) {
    return (
      <View style={styles.emptyPanel}>
        <Text style={styles.emptyTitle}>No songs staged</Text>
        <Text style={styles.emptyBody}>
          Choose songs to review them before saving.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {songs.map((song) => (
        <View key={song.id} style={styles.row}>
          <View style={styles.rowText}>
            <Text numberOfLines={1} style={styles.title}>
              {song.title}
            </Text>
            <Text numberOfLines={1} style={styles.meta}>
              {song.artist} / {song.album}
            </Text>
            <Text numberOfLines={1} style={styles.fileName}>
              {song.fileName}
            </Text>
          </View>
          <Text style={styles.duration}>{formatDuration(song.duration)}</Text>
          {onRemoveSong ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => onRemoveSong(song.id)}
              style={styles.removeButton}
            >
              <Text style={styles.removeText}>Remove</Text>
            </Pressable>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyPanel: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  emptyTitle: {
    color: "#121417",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 21,
  },
  emptyBody: {
    color: "#52605a",
    fontSize: 14,
    lineHeight: 20,
  },
  list: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    alignItems: "center",
    borderBottomColor: "#edf2ef",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 76,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  rowText: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  title: {
    color: "#121417",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 20,
  },
  meta: {
    color: "#52605a",
    fontSize: 13,
    lineHeight: 18,
  },
  fileName: {
    color: "#74807a",
    fontSize: 12,
    lineHeight: 16,
  },
  duration: {
    color: "#29322e",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    minWidth: 44,
    textAlign: "right",
  },
  removeButton: {
    alignItems: "center",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 34,
    minWidth: 76,
    paddingHorizontal: 10,
  },
  removeText: {
    color: "#b42318",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
});
