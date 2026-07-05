import { View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibraryCollectionDetailSong } from "../hooks/use-library-collection-detail-query";
import type { getCollectionDetailViewState } from "../services/library-collection-interaction-service";
import { LibraryCollectionSongEmptyState } from "./LibraryCollectionSongEmptyState";
import { LibraryCollectionSongRow } from "./LibraryCollectionSongRow";

type LibraryCollectionSongEmptyStateModel = ReturnType<
  typeof getCollectionDetailViewState
>["songSection"]["emptyState"];

type LibraryCollectionSongListProps = {
  canMutateSongs?: boolean;
  emptyState: LibraryCollectionSongEmptyStateModel;
  movingSongId?: number | null;
  onMoveSong?: (songId: number, direction: "down" | "up") => void;
  onRemoveSong?: (songId: number) => void;
  removingSongId?: number | null;
  songs: LibraryCollectionDetailSong[];
};

export function LibraryCollectionSongList({
  canMutateSongs = true,
  emptyState,
  movingSongId,
  onMoveSong,
  onRemoveSong,
  removingSongId,
  songs,
}: LibraryCollectionSongListProps) {
  const theme = useCustomizationTheme();

  if (songs.length === 0) {
    return <LibraryCollectionSongEmptyState emptyState={emptyState} />;
  }

  return (
    <View
      className="overflow-hidden rounded-lg border"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      {songs.map((song, index) => (
        <LibraryCollectionSongRow
          canMutateSongs={canMutateSongs}
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
