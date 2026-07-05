import type { AddableCollectionSong } from "./addable-collection-songs-types-service";
import {
  getAddableSongRows,
  type AddableSongSelectionState,
} from "./add-collection-songs-selection-service";
import {
  getAddCollectionSongsFormState,
  type AddCollectionSongsFormState,
} from "./add-collection-songs-form-state-service";
import type { AddCollectionSongsCollectionKind } from "./add-collection-songs-kind-service";
import { getAddCollectionSongsStatusState } from "./add-collection-songs-status-state-service";

export type { AddCollectionSongsFormState };

export const getAddCollectionSongsFormViewState = ({
  collectionId,
  errors,
  kind,
  mutationError,
  savingSongId,
  selectedSongIds,
  selectionState,
  songs,
  updatedAt,
}: {
  collectionId: number;
  errors: readonly unknown[];
  kind: AddCollectionSongsCollectionKind;
  mutationError: string | null;
  savingSongId: number | null;
  selectedSongIds: Set<number>;
  selectionState: AddableSongSelectionState;
  songs: AddableCollectionSong[];
  updatedAt: number;
}) => {
  const statusState = getAddCollectionSongsStatusState({
    errors,
    mutationError,
    updatedAt,
  });

  return {
    formState: getAddCollectionSongsFormState({
      collectionId,
      kind,
    }),
    rows: getAddableSongRows({
      savingSongId,
      selectedSongIds,
      songs,
    }),
    statusState,
    updatedLabel: statusState.updatedLabel,
  };
};

export type AddCollectionSongsFormViewState = ReturnType<
  typeof getAddCollectionSongsFormViewState
>;
