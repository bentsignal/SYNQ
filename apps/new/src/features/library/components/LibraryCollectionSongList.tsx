import { View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { getCollectionDetailViewState } from "../services/library-collection-detail-view-state-service";
import type { CollectionSongRowViewModel } from "../services/library-collection-song-mutation-service";
import { LibraryCollectionSongEmptyState } from "./LibraryCollectionSongEmptyState";
import { LibraryCollectionSongRow } from "./LibraryCollectionSongRow";

type LibraryCollectionSongEmptyStateModel = ReturnType<
  typeof getCollectionDetailViewState
>["songSection"]["emptyState"];

type LibraryCollectionSongListProps = {
  emptyState: LibraryCollectionSongEmptyStateModel;
  onMoveSong?: (songId: number, direction: "down" | "up") => void;
  onRemoveSong?: (songId: number) => void;
  rows: CollectionSongRowViewModel[];
};

export function LibraryCollectionSongList({
  emptyState,
  onMoveSong,
  onRemoveSong,
  rows,
}: LibraryCollectionSongListProps) {
  const theme = useCustomizationTheme();

  if (rows.length === 0) {
    return <LibraryCollectionSongEmptyState emptyState={emptyState} />;
  }

  return (
    <View
      className="overflow-hidden rounded-lg border"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      {rows.map(({ song, viewState }) => (
        <LibraryCollectionSongRow
          key={song.id}
          onMoveSong={onMoveSong}
          onRemoveSong={onRemoveSong}
          song={song}
          viewState={viewState}
        />
      ))}
    </View>
  );
}
