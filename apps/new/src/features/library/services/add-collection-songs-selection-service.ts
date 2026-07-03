import type { AddableCollectionSong } from "./addable-collection-songs-service";

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

export const toggleSongIdSelection = ({
  selectedSongIds,
  songId,
}: {
  selectedSongIds: Set<number>;
  songId: number;
}) => {
  const nextSelection = new Set(selectedSongIds);

  if (nextSelection.has(songId)) {
    nextSelection.delete(songId);
  } else {
    nextSelection.add(songId);
  }

  return nextSelection;
};

export const removeSongIdSelection = ({
  selectedSongIds,
  songId,
}: {
  selectedSongIds: Set<number>;
  songId: number;
}) => {
  const nextSelection = new Set(selectedSongIds);
  nextSelection.delete(songId);

  return nextSelection;
};

export const getAddableSongRowState = ({
  savingSongId,
  selectedSongIds,
  song,
}: {
  savingSongId: number | null;
  selectedSongIds: Set<number>;
  song: AddableCollectionSong;
}) => {
  const isSaving = savingSongId === song.id;
  const isDisabled = song.isLinked || isSaving;
  const isSelected = selectedSongIds.has(song.id) && !song.isLinked;

  return {
    addLabel: song.isLinked ? "Added" : isSaving ? "Adding" : "Add",
    isDisabled,
    isSaving,
    isSelected,
  };
};
