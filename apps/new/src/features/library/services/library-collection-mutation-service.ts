import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import type { LibraryCollectionDetailKind } from "./library-collection-kind-service";
import {
  getCollectionListHref,
  type LibraryCollectionListHref,
} from "./library-collection-navigation-service";

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

type CollectionDetailMutationActionCommand = {
  action: CollectionDetailMutationAction;
};

type CollectionDetailMutationHapticCommand = {
  haptic: HapticFeedbackType;
};

type CollectionDetailMutationFailureCommand =
  CollectionDetailMutationActionCommand & CollectionDetailMutationHapticCommand;

type CollectionDetailMutationNavigationCommand =
  CollectionDetailMutationHapticCommand & {
    href: LibraryCollectionListHref;
  };

export const getCollectionDetailMutationBlockedCommand =
  (): CollectionDetailMutationHapticCommand => ({
    haptic: "error",
  });

export const getCollectionDeleteStartCommand =
  (): CollectionDetailMutationActionCommand => ({
    action: {
      mutation: "delete-collection",
      type: "begin",
    },
  });

export const getCollectionDeleteSuccessCommand = ({
  kind,
}: {
  kind: LibraryCollectionDetailKind;
}): CollectionDetailMutationNavigationCommand => ({
  haptic: "success",
  href: getCollectionListHref(kind),
});

export const getCollectionDeleteFinishCommand =
  (): CollectionDetailMutationActionCommand => ({
    action: {
      mutation: "delete-collection",
      type: "finish",
    },
  });

export const getCollectionSongMoveStartCommand = (
  songId: number,
): CollectionDetailMutationActionCommand => ({
  action: {
    mutation: "move-song",
    songId,
    type: "begin",
  },
});

export const getCollectionSongMoveSuccessCommand =
  (): CollectionDetailMutationHapticCommand => ({
    haptic: "light",
  });

export const getCollectionSongMoveFinishCommand =
  (): CollectionDetailMutationActionCommand => ({
    action: {
      mutation: "move-song",
      type: "finish",
    },
  });

export const getCollectionSongRemovalStartCommand = (
  songId: number,
): CollectionDetailMutationActionCommand => ({
  action: {
    mutation: "remove-song",
    songId,
    type: "begin",
  },
});

export const getCollectionSongRemovalSuccessCommand =
  (): CollectionDetailMutationHapticCommand => ({
    haptic: "medium",
  });

export const getCollectionSongRemovalFinishCommand =
  (): CollectionDetailMutationActionCommand => ({
    action: {
      mutation: "remove-song",
      type: "finish",
    },
  });

export const getCollectionDetailMutationFailureCommand = ({
  caughtError,
  mutation,
}: {
  caughtError: unknown;
  mutation: CollectionDetailMutationKind;
}): CollectionDetailMutationFailureCommand => ({
  action: {
    error: getCollectionDetailMutationErrorMessage({
      caughtError,
      mutation,
    }),
    type: "fail",
  },
  haptic: "error",
});
