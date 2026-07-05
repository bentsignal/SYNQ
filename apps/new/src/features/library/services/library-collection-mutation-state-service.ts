import {
  beginCollectionDetailMutation,
  finishCollectionDetailMutation,
} from "./library-collection-mutation-step-service";

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
      return beginCollectionDetailMutation({
        mutation: action.mutation,
        songId: "songId" in action ? action.songId : undefined,
        state,
      });
    case "finish":
      return finishCollectionDetailMutation({
        mutation: action.mutation,
        state,
      });
    case "fail":
      return {
        ...state,
        mutationError: action.error,
      };
  }
};
