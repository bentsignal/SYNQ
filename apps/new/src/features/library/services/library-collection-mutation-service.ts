import type { LibraryCollectionDetailSong } from "./library-collection-detail-service";

export type CollectionDetailMutationKind =
  | "delete-collection"
  | "export-collection"
  | "move-song"
  | "remove-song";

export type CollectionDetailMutationState = {
  isDeleting: boolean;
  isExporting: boolean;
  movingSongId: number | null;
  mutationError: string | null;
  removingSongId: number | null;
};

export type CollectionDetailMutationAction =
  | {
      mutation: "delete-collection" | "export-collection";
      type: "begin";
    }
  | {
      mutation: "move-song" | "remove-song";
      songId: number;
      type: "begin";
    }
  | {
      mutation: CollectionDetailMutationKind;
      type: "finish";
    }
  | {
      error: string;
      type: "fail";
    };

export const initialCollectionDetailMutationState: CollectionDetailMutationState =
  {
    isDeleting: false,
    isExporting: false,
    movingSongId: null,
    mutationError: null,
    removingSongId: null,
  };

export const collectionDetailMutationReducer = (
  state: CollectionDetailMutationState,
  action: CollectionDetailMutationAction,
): CollectionDetailMutationState => {
  switch (action.type) {
    case "begin":
      switch (action.mutation) {
        case "delete-collection":
          return {
            ...state,
            isDeleting: true,
            mutationError: null,
          };
        case "export-collection":
          return {
            ...state,
            isExporting: true,
            mutationError: null,
          };
        case "move-song":
          return {
            ...state,
            movingSongId: action.songId,
            mutationError: null,
          };
        case "remove-song":
          return {
            ...state,
            mutationError: null,
            removingSongId: action.songId,
          };
      }
    case "finish":
      switch (action.mutation) {
        case "delete-collection":
          return {
            ...state,
            isDeleting: false,
          };
        case "export-collection":
          return {
            ...state,
            isExporting: false,
          };
        case "move-song":
          return {
            ...state,
            movingSongId: null,
          };
        case "remove-song":
          return {
            ...state,
            removingSongId: null,
          };
      }
    case "fail":
      return {
        ...state,
        mutationError: action.error,
      };
  }
};

export const getCollectionDetailMutationErrorMessage = ({
  caughtError,
  mutation,
}: {
  caughtError: unknown;
  mutation: CollectionDetailMutationKind;
}) => {
  if (caughtError instanceof Error) {
    return caughtError.message;
  }

  switch (mutation) {
    case "delete-collection":
      return "Collection could not be deleted.";
    case "export-collection":
      return "Songs could not be exported.";
    case "move-song":
      return "Song order could not be saved.";
    case "remove-song":
      return "Song could not be removed.";
  }
};

export const reorderCollectionSongs = ({
  direction,
  songId,
  songs,
}: {
  direction: "down" | "up";
  songId: number;
  songs: LibraryCollectionDetailSong[];
}) => {
  const fromIndex = songs.findIndex((song) => song.id === songId);

  if (fromIndex < 0) {
    return songs;
  }

  const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;

  if (toIndex < 0 || toIndex >= songs.length) {
    return songs;
  }

  const nextSongs = [...songs];
  const [movedSong] = nextSongs.splice(fromIndex, 1);
  nextSongs.splice(toIndex, 0, movedSong);

  return nextSongs;
};

export const getCollectionSongOrderUpdate = ({
  direction,
  songId,
  songs,
}: {
  direction: "down" | "up";
  songId: number;
  songs: LibraryCollectionDetailSong[];
}) => ({
  songIds: reorderCollectionSongs({ direction, songId, songs }).map(
    (song) => song.id,
  ),
});

export const getCollectionSongListState = ({
  movingSongId,
  removingSongId,
}: {
  movingSongId: number | null;
  removingSongId: number | null;
}) => ({
  isMutating: movingSongId !== null || removingSongId !== null,
});

export const getCollectionSongRowActionState = ({
  index,
  movingSongId,
  removingSongId,
  songId,
  totalSongs,
}: {
  index: number;
  movingSongId: number | null;
  removingSongId: number | null;
  songId: number;
  totalSongs: number;
}) => {
  const { isMutating } = getCollectionSongListState({
    movingSongId,
    removingSongId,
  });
  const isMoving = movingSongId === songId;
  const isRemoving = removingSongId === songId;

  return {
    canMoveDown: !isMutating && index < totalSongs - 1,
    canMoveUp: !isMutating && index > 0,
    canRemove: !isMutating,
    downLabel: isMoving ? "Moving" : "Down",
    isMoving,
    isRemoving,
    removeLabel: isRemoving ? "Removing" : "Remove",
    upLabel: isMoving ? "Moving" : "Up",
  };
};
