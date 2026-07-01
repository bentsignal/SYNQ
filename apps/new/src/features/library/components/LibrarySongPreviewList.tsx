import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type {
  LibrarySongPreview,
  LibrarySongPreviewOrder,
  LibrarySongPreviewSort,
} from "../hooks/use-library-song-preview-query";
import { LibrarySongListControls } from "./LibrarySongListControls";

type LibrarySongPreviewListProps = {
  isEmpty: boolean;
  order: LibrarySongPreviewOrder;
  query: string;
  setOrder: (order: LibrarySongPreviewOrder) => void;
  setQuery: (query: string) => void;
  setSort: (sort: LibrarySongPreviewSort) => void;
  songs: LibrarySongPreview[];
  sort: LibrarySongPreviewSort;
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

export function LibrarySongPreviewList({
  isEmpty,
  order,
  query,
  setOrder,
  setQuery,
  setSort,
  songs,
  sort,
}: LibrarySongPreviewListProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Songs</Text>
        <Text style={styles.sectionMeta}>{songs.length} shown</Text>
      </View>

      <LibrarySongListControls
        order={order}
        query={query}
        setOrder={setOrder}
        setQuery={setQuery}
        setSort={setSort}
        sort={sort}
      />

      {isEmpty ? (
        <View style={styles.emptyPanel}>
          <Text style={styles.emptyTitle}>No songs yet</Text>
          <Text style={styles.emptyBody}>
            Imported tracks will appear here once the shared library database has
            rows to render.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {songs.map((song) => (
            <Link
              asChild
              href={`/(tabs)/library/song/${song.id}`}
              key={song.id}
            >
              <Pressable style={styles.row}>
                <View style={styles.rowText}>
                  <Text numberOfLines={1} style={styles.songTitle}>
                    {song.title}
                  </Text>
                  <Text numberOfLines={1} style={styles.songMeta}>
                    {song.artist} / {song.album}
                  </Text>
                </View>
                <Text style={styles.duration}>
                  {formatDuration(song.duration)}
                </Text>
              </Pressable>
            </Link>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  sectionHeader: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: "#121417",
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 25,
  },
  sectionMeta: {
    color: "#52605a",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 17,
    textTransform: "uppercase",
  },
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
  rowText: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  songTitle: {
    color: "#121417",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 20,
  },
  songMeta: {
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
