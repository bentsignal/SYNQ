import type { AddableCollectionSong } from "./addable-collection-songs-types-service";
import type { AddCollectionSongsControllerState } from "./add-collection-songs-state-service";

export {
  getAddableSongRowState,
  getAddableSongRows,
  type AddableSongRowModel,
  type AddableSongRowState,
} from "./add-collection-songs-row-state-service";

export const getSelectedAddableSongIds = ({
  selectedSongIds,
  songs,
}: {
  selectedSongIds: Set<number>;
  songs: AddableCollectionSong[];
}) =>
  Array.from(selectedSongIds).filter((songId) =>
    songs.some((song) => song.id === songId && !song.isLinked),
  );

export const getAddableSongSelectionState = ({
  isAddingSelection,
  savingSongId,
  selectedSongIds,
  songs,
}: {
  isAddingSelection: boolean;
  savingSongId: number | null;
  selectedSongIds: Set<number>;
  songs: AddableCollectionSong[];
}) => {
  const selectedAddableSongIds = getSelectedAddableSongIds({
    selectedSongIds,
    songs,
  });
  const selectedCount = selectedAddableSongIds.length;
  const isMutating = isAddingSelection || savingSongId !== null;

  return {
    bulkAddLabel: isAddingSelection ? "Adding" : "Add selected",
    canBulkAdd: selectedCount > 0 && !isMutating,
    isMutating,
    selectedAddableSongIds,
    selectedCount,
    selectionLabel:
      selectedCount === 0
        ? "Select songs to add several at once."
        : `${selectedCount} selected`,
  };
};

export type AddableSongSelectionState = ReturnType<
  typeof getAddableSongSelectionState
>;

export const getAddCollectionSongsControllerResultState = ({
  controllerState,
  songs,
}: {
  controllerState: AddCollectionSongsControllerState;
  songs: AddableCollectionSong[];
}) => ({
  mutationError: controllerState.mutationError,
  savingSongId: controllerState.savingSongId,
  selectedSongIds: controllerState.selectedSongIds,
  selectionState: getAddableSongSelectionState({
    isAddingSelection: controllerState.isAddingSelection,
    savingSongId: controllerState.savingSongId,
    songs,
    selectedSongIds: controllerState.selectedSongIds,
  }),
});

export type AddCollectionSongsControllerResultState = ReturnType<
  typeof getAddCollectionSongsControllerResultState
>;
