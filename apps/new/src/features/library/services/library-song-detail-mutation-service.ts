export type LibrarySongDetailMutationKind =
  | "delete-song"
  | "export-song"
  | "toggle-liked";

export type LibrarySongDetailMutationState = {
  error: string | null;
  isDeleting: boolean;
  isExporting: boolean;
  isTogglingLiked: boolean;
};

export type LibrarySongDetailMutationAction =
  | {
      mutation: LibrarySongDetailMutationKind;
      type: "begin";
    }
  | {
      mutation: LibrarySongDetailMutationKind;
      type: "finish";
    }
  | {
      error: string;
      type: "fail";
    };

export const initialLibrarySongDetailMutationState: LibrarySongDetailMutationState =
  {
    error: null,
    isDeleting: false,
    isExporting: false,
    isTogglingLiked: false,
  };

const getMutationFlag = (mutation: LibrarySongDetailMutationKind) => {
  switch (mutation) {
    case "delete-song":
      return "isDeleting";
    case "export-song":
      return "isExporting";
    case "toggle-liked":
      return "isTogglingLiked";
  }
};

export const librarySongDetailMutationReducer = (
  state: LibrarySongDetailMutationState,
  action: LibrarySongDetailMutationAction,
): LibrarySongDetailMutationState => {
  switch (action.type) {
    case "begin":
      return {
        ...state,
        [getMutationFlag(action.mutation)]: true,
        error: null,
      };
    case "finish":
      return {
        ...state,
        [getMutationFlag(action.mutation)]: false,
      };
    case "fail":
      return {
        ...state,
        error: action.error,
      };
  }
};
