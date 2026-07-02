import { Link, router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatDurationMs } from "@/src/features/app-shell/services/duration-format-service";
import { usePlaybackSession } from "@/src/features/playback/hooks/use-playback-session";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
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
  const theme = useCustomizationTheme();
  const { activeTrack, addToQueue, playSong } = usePlaybackSession();
  const { sendHaptic } = useHapticFeedback();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>
          Recent Songs
        </Text>
        <Text style={[styles.sectionMeta, { color: theme.secondaryText }]}>
          {songs.length} shown
        </Text>
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
        <View
          style={[
            styles.emptyPanel,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.emptyTitle, { color: theme.primaryText }]}>
            No songs yet
          </Text>
          <Text style={[styles.emptyBody, { color: theme.secondaryText }]}>
            Import audio files to start building your song library.
          </Text>
          <Link href="/(tabs)/import" style={[styles.emptyLink, { color: theme.accent }]}>
            Import music
          </Link>
        </View>
      ) : (
        <View
          style={[
            styles.list,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {songs.map((song) => {
            const canPlay = song.pathToFile !== null;
            const isActive = activeTrack?.id === song.id;
            const playbackItem = {
              album: song.album,
              artist: song.artist,
              duration: song.duration,
              id: song.id,
              pathToFile: song.pathToFile,
              title: song.title,
            };

            return (
              <View
                key={song.id}
                style={[
                  styles.row,
                  { borderBottomColor: theme.borderSubtle },
                  isActive
                    ? { backgroundColor: theme.borderSubtle }
                    : null,
                ]}
              >
                <Link asChild href={`/(tabs)/library/song/${song.id}`}>
                  <Pressable style={styles.rowText}>
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
                  </Pressable>
                </Link>
                <Text style={[styles.duration, { color: theme.primaryText }]}>
                  {formatDurationMs(song.duration)}
                </Text>
                <View style={styles.actionGroup}>
                  <Pressable
                    accessibilityLabel={`Play ${song.title}`}
                    accessibilityRole="button"
                    disabled={!canPlay}
                    onPress={() => {
                      sendHaptic("light");
                      playSong(playbackItem);
                      router.push("/player");
                    }}
                    style={[
                      styles.actionButton,
                      {
                        backgroundColor: theme.accent,
                        borderColor: theme.accent,
                      },
                      !canPlay ? styles.disabled : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.primaryActionText,
                        { color: theme.onAccent },
                      ]}
                    >
                      Play
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityLabel={`Add ${song.title} to queue`}
                    accessibilityRole="button"
                    disabled={!canPlay}
                    onPress={() => {
                      sendHaptic("light");
                      addToQueue(playbackItem);
                    }}
                    style={[
                      styles.actionButton,
                      {
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                      },
                      !canPlay ? styles.disabled : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.secondaryActionText,
                        { color: theme.accent },
                      ]}
                    >
                      Queue
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
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
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 25,
  },
  sectionMeta: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 17,
    textTransform: "uppercase",
  },
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
  emptyLink: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
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
  rowText: {
    flex: 1,
    gap: 4,
    justifyContent: "center",
    minHeight: 46,
    minWidth: 0,
  },
  songTitle: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 20,
  },
  songMeta: {
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
  actionGroup: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 36,
    minWidth: 58,
    paddingHorizontal: 10,
  },
  disabled: {
    opacity: 0.45,
  },
  primaryActionText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  secondaryActionText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
});
