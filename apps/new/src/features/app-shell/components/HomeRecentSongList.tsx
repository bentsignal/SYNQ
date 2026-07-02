import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatDurationMs } from "@/src/features/app-shell/services/duration-format-service";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { useLibrarySongPreviewQuery } from "@/src/features/library/hooks/use-library-song-preview-query";
import { getHomeRecentSongHref } from "../services/home-screen-service";

type HomeRecentSongListProps = {
  hasLibrary: boolean;
  recentSongs: ReturnType<typeof useLibrarySongPreviewQuery>;
};

export function HomeRecentSongList({
  hasLibrary,
  recentSongs,
}: HomeRecentSongListProps) {
  const theme = useCustomizationTheme();

  return (
    <View
      style={[
        styles.songList,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      {hasLibrary && !recentSongs.isEmpty ? (
        recentSongs.songs.map((song) => (
          <Link
            asChild
            href={getHomeRecentSongHref({ songId: song.id })}
            key={song.id}
          >
            <Pressable
              style={[
                styles.songRow,
                { borderBottomColor: theme.borderSubtle },
              ]}
            >
              <View style={styles.songCopy}>
                <Text
                  numberOfLines={1}
                  style={[styles.songTitle, { color: theme.primaryText }]}
                >
                  {song.title}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[styles.bodyText, { color: theme.secondaryText }]}
                >
                  {song.artist} - {song.album}
                </Text>
              </View>
              <Text style={[styles.duration, { color: theme.mutedText }]}>
                {formatDurationMs(song.duration)}
              </Text>
            </Pressable>
          </Link>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={[styles.songTitle, { color: theme.primaryText }]}>
            Build your library
          </Text>
          <Text style={[styles.bodyText, { color: theme.secondaryText }]}>
            Import audio files to see recent songs here.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bodyText: {
    fontSize: 14,
    lineHeight: 20,
  },
  duration: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0,
    minWidth: 44,
    textAlign: "right",
  },
  emptyState: {
    gap: 6,
    justifyContent: "center",
    minHeight: 112,
    padding: 16,
  },
  songCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  songList: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  songRow: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 72,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 22,
  },
});
