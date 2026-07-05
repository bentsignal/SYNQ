import type { AddableCollectionSong } from "./addable-collection-songs-service";
import {
  getAddableSongRows,
  type AddableSongSelectionState,
} from "./add-collection-songs-selection-service";
import { getAddCollectionSongsStatusState } from "./add-collection-songs-status-state-service";

export {
  getAddCollectionSongsStatusState,
  getAddCollectionSongsUpdatedLabel,
  type AddCollectionSongsStatusState,
} from "./add-collection-songs-status-state-service";

export type AddCollectionSongsCollectionKind = "album" | "artist" | "playlist";

export const getAddCollectionSongsBackHref = ({
  collectionId,
  kind,
}: {
  collectionId: number;
  kind: AddCollectionSongsCollectionKind;
}) => `/(tabs)/library/${kind}/${collectionId}` as const;

export const getAddCollectionSongsHeaderState = ({
  kind,
}: {
  kind: AddCollectionSongsCollectionKind;
}) => ({
  kicker: "Add songs",
  searchInput: {
    placeholder: "Search songs, artists, or albums",
    returnKeyType: "search" as const,
  },
  subtitle: "Search your songs and add them to this collection.",
  title: `Add to ${kind}`,
});

export const getAddCollectionSongsBackLink = ({
  collectionId,
  kind,
}: {
  collectionId: number;
  kind: AddCollectionSongsCollectionKind;
}) => ({
  href: getAddCollectionSongsBackHref({ collectionId, kind }),
  label: "Back to collection",
});

export const getAddCollectionSongsFormState = ({
  collectionId,
  kind,
}: {
  collectionId: number;
  kind: AddCollectionSongsCollectionKind;
}) => ({
  backLink: getAddCollectionSongsBackLink({ collectionId, kind }),
  header: getAddCollectionSongsHeaderState({ kind }),
});

export type AddCollectionSongsFormState = ReturnType<
  typeof getAddCollectionSongsFormState
>;

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
