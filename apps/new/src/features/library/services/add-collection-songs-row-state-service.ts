import type { AddableCollectionSong } from "./addable-collection-songs-types-service";

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

export type AddableSongRowState = ReturnType<typeof getAddableSongRowState>;

export const getAddableSongRows = ({
  savingSongId,
  selectedSongIds,
  songs,
}: {
  savingSongId: number | null;
  selectedSongIds: Set<number>;
  songs: AddableCollectionSong[];
}) =>
  songs.map((song) => ({
    rowState: getAddableSongRowState({
      savingSongId,
      selectedSongIds,
      song,
    }),
    song,
  }));

export type AddableSongRowModel = ReturnType<
  typeof getAddableSongRows
>[number];
