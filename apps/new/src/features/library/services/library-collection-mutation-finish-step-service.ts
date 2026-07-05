import type {
  CollectionDetailMutationKind,
  CollectionDetailMutationState,
} from "./library-collection-mutation-state-service";

export const finishCollectionDetailMutation = ({
  mutation,
  state,
}: {
  mutation: CollectionDetailMutationKind;
  state: CollectionDetailMutationState;
}): CollectionDetailMutationState => {
  switch (mutation) {
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
};
