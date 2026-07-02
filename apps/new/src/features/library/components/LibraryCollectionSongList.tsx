import { StyleSheet, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibraryCollectionDetailSong } from "../hooks/use-library-collection-detail-query";
import { LibraryCollectionSongEmptyState } from "./LibraryCollectionSongEmptyState";
import { LibraryCollectionSongRow } from "./LibraryCollectionSongRow";

type LibraryCollectionSongListProps = {
  movingSongId?: number | null;
  onMoveSong?: (songId: number, direction: "down" | "up") => void;
  onRemoveSong?: (songId: number) => void;
  removingSongId?: number | null;
  songs: LibraryCollectionDetailSong[];
};

export function LibraryCollectionSongList({
  movingSongId,
  onMoveSong,
  onRemoveSong,
  removingSongId,
  songs,
}: LibraryCollectionSongListProps) {
  const theme = useCustomizationTheme();

  if (songs.length === 0) {
    return <LibraryCollectionSongEmptyState />;
  }

  return (
    <View
      style={[
        styles.list,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      {songs.map((song, index) => (
        <LibraryCollectionSongRow
          index={index}
          key={song.id}
          movingSongId={movingSongId}
          onMoveSong={onMoveSong}
          onRemoveSong={onRemoveSong}
          removingSongId={removingSongId}
          song={song}
          totalSongs={songs.length}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
});
