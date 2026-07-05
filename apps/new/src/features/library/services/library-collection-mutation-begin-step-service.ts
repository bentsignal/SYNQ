import type {
  CollectionDetailMutationKind,
  CollectionDetailMutationState,
} from "./library-collection-mutation-state-service";

type CollectionDetailSongMutationKind = "move-song" | "remove-song";

export const beginCollectionDetailMutation = ({
  mutation,
  songId,
  state,
}: {
  mutation: CollectionDetailMutationKind;
  songId?: number;
  state: CollectionDetailMutationState;
}): CollectionDetailMutationState => {
  switch (mutation) {
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
      return beginCollectionDetailSongMutation({ mutation, songId, state });
    case "remove-song":
      return beginCollectionDetailSongMutation({ mutation, songId, state });
  }
};

const beginCollectionDetailSongMutation = ({
  mutation,
  songId,
  state,
}: {
  mutation: CollectionDetailSongMutationKind;
  songId?: number;
  state: CollectionDetailMutationState;
}): CollectionDetailMutationState => {
  if (mutation === "move-song") {
    return {
      ...state,
      movingSongId: songId ?? null,
      mutationError: null,
    };
  }

  return {
    ...state,
    mutationError: null,
    removingSongId: songId ?? null,
  };
};
