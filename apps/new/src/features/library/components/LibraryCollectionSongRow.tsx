import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatDurationMs } from "@/src/features/app-shell/services/duration-format-service";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibraryCollectionDetailSong } from "../hooks/use-library-collection-detail-query";
import { getCollectionSongRowActionState } from "../services/library-collection-song-mutation-service";
import { getLibrarySongDetailHref } from "../services/library-song-interaction-service";
import { LibraryCollectionSongRowActions } from "./LibraryCollectionSongRowActions";

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
      <LibraryCollectionSongRowActions
        onMoveSong={
          onMoveSong ? (direction) => onMoveSong(song.id, direction) : undefined
        }
        onRemoveSong={onRemoveSong ? () => onRemoveSong(song.id) : undefined}
        rowState={rowState}
        songTitle={song.title}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
