import { useAddCollectionSongsController } from "./use-add-collection-songs-controller";
import type { AddableCollectionSongsQueryResult } from "./use-addable-collection-songs-query";
import { getAddCollectionSongsFormViewState } from "../services/addable-collection-songs-screen-state-service";
import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";

export function useAddCollectionSongsFormController({
  addable,
  collectionId,
  kind,
  onChangeQuery,
  query,
}: {
  addable: AddableCollectionSongsQueryResult;
  collectionId: number;
  kind: LibraryCollectionDetailKind;
  onChangeQuery: (query: string) => void;
  query: string;
}) {
  const { errors, songs, updatedAt } = addable;
  const {
    addSelectedSongs,
    addSong,
    mutationError,
    savingSongId,
    selectedSongIds,
    selectionState,
    toggleSongSelection,
  } = useAddCollectionSongsController({
    collectionId,
    kind,
    songs,
  });
  const viewState = getAddCollectionSongsFormViewState({
    collectionId,
    errors,
    kind,
    mutationError,
    savingSongId,
    selectedSongIds,
    selectionState,
    songs,
    updatedAt,
  });

  return {
    formState: viewState.formState,
    onAddSelectedSongs: addSelectedSongs,
    onAddSong: addSong,
    onChangeQuery,
    onToggleSongSelection: toggleSongSelection,
    query,
    rows: viewState.rows,
    selectionState,
    statusState: viewState.statusState,
    updatedLabel: viewState.updatedLabel,
  };
}

export type AddCollectionSongsFormController = ReturnType<
  typeof useAddCollectionSongsFormController
>;
