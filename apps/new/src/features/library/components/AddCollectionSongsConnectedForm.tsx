import type {
  AddableCollectionSongsQueryResult,
} from "../hooks/use-addable-collection-songs-query";
import { useAddCollectionSongsController } from "../hooks/use-add-collection-songs-controller";
import type { LibraryCollectionDetailKind } from "../hooks/use-library-collection-detail-query";
import { getAddCollectionSongsUpdatedLabel } from "../services/addable-collection-songs-service";
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
  const hasErrors = errors.length > 0;
  const updatedLabel = getAddCollectionSongsUpdatedLabel({ updatedAt });
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

  return (
    <AddCollectionSongsFormView
      collectionId={collectionId}
      hasErrors={hasErrors}
      kind={kind}
      mutationError={mutationError}
      onAddSelectedSongs={addSelectedSongs}
      onAddSong={addSong}
      onChangeQuery={onChangeQuery}
      onToggleSongSelection={toggleSongSelection}
      query={query}
      savingSongId={savingSongId}
      selectedSongIds={selectedSongIds}
      selectionState={selectionState}
      songs={songs}
      updatedLabel={updatedLabel}
    />
  );
}
