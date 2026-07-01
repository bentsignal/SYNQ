import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { LibraryCollectionDetailSong } from "../hooks/use-library-collection-detail-query";

type LibraryCollectionSongListProps = {
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
  songs,
}: LibraryCollectionSongListProps) {
  if (songs.length === 0) {
    return (
      <View style={styles.emptyPanel}>
        <Text style={styles.emptyTitle}>No songs here yet</Text>
        <Text style={styles.emptyBody}>
          This detail view is live and will update when matching songs are added
          to the shared library database.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {songs.map((song) => (
        <Link asChild href={`/(tabs)/library/song/${song.id}`} key={song.id}>
          <Pressable style={styles.row}>
            <Text style={styles.track}>
              {song.track !== null ? song.track.toString() : ""}
            </Text>
            <View style={styles.rowText}>
              <Text numberOfLines={1} style={styles.title}>
                {song.title}
              </Text>
              <Text numberOfLines={1} style={styles.meta}>
                {song.artist} / {song.album}
              </Text>
            </View>
            <Text style={styles.duration}>{formatDuration(song.duration)}</Text>
          </Pressable>
        </Link>
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
    minHeight: 66,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  track: {
    color: "#74807a",
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
  duration: {
    color: "#29322e",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    minWidth: 44,
    textAlign: "right",
  },
});
