import type {
  AddableCollectionSongsQueryResult,
} from "../hooks/use-addable-collection-songs-query";
import { useAddCollectionSongsController } from "../hooks/use-add-collection-songs-controller";
import {
  getAddCollectionSongsFormState,
  getAddCollectionSongsStatusState,
} from "../services/addable-collection-songs-screen-state-service";
import { getAddableSongRows } from "../services/add-collection-songs-selection-service";
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
  const statusState = getAddCollectionSongsStatusState({
    errors,
    mutationError,
    updatedAt,
  });
  const formState = getAddCollectionSongsFormState({
    collectionId,
    kind,
  });
  const rows = getAddableSongRows({
    savingSongId,
    selectedSongIds,
    songs,
  });

  return (
    <AddCollectionSongsFormView
      formState={formState}
      onAddSelectedSongs={addSelectedSongs}
      onAddSong={addSong}
      onChangeQuery={onChangeQuery}
      onToggleSongSelection={toggleSongSelection}
      query={query}
      rows={rows}
      selectionState={selectionState}
      statusState={statusState}
      updatedLabel={statusState.updatedLabel}
    />
  );
}
