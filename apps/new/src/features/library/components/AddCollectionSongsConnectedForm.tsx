import type {
  AddableCollectionSongsQueryResult,
} from "../hooks/use-addable-collection-songs-query";
import { useAddCollectionSongsController } from "../hooks/use-add-collection-songs-controller";
import {
  getAddCollectionSongsFormViewState,
} from "../services/addable-collection-songs-screen-state-service";
import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";
import { AddCollectionSongsFormView } from "./AddCollectionSongsFormView";

type AddCollectionSongsConnectedFormProps = {
  addable: AddableCollectionSongsQueryResult;
  collectionId: number;
  kind: LibraryCollectionDetailKind;
  onChangeQuery: (query: string) => void;
  query: string;
};

export function AddCollectionSongsConnectedForm({
  addable,
  collectionId,
  kind,
  onChangeQuery,
  query,
}: AddCollectionSongsConnectedFormProps) {
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

  return (
    <AddCollectionSongsFormView
      formState={viewState.formState}
      onAddSelectedSongs={addSelectedSongs}
      onAddSong={addSong}
      onChangeQuery={onChangeQuery}
      onToggleSongSelection={toggleSongSelection}
      query={query}
      rows={viewState.rows}
      selectionState={selectionState}
      statusState={viewState.statusState}
      updatedLabel={viewState.updatedLabel}
    />
  );
}
