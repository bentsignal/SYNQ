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
