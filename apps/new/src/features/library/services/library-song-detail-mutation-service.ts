import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import {
  getLibrarySongDeleteSuccessHref,
  type LibrarySongDetailHref,
} from "./library-song-interaction-service";

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

export const getLibrarySongDetailMutationErrorMessage = ({
  caughtError,
  mutation,
}: {
  caughtError: unknown;
  mutation: LibrarySongDetailMutationKind;
}) => {
  if (caughtError instanceof Error) {
    return caughtError.message;
  }

  switch (mutation) {
    case "delete-song":
      return "Song could not be deleted.";
    case "export-song":
      return "Song could not be exported.";
    case "toggle-liked":
      return "Liked Songs could not be updated.";
  }
};

type LibrarySongDetailMutationHapticCommand = {
  haptic: HapticFeedbackType;
};

type LibrarySongDetailMutationActionCommand = {
  action: LibrarySongDetailMutationAction;
};

type LibrarySongDetailMutationFailureCommand =
  LibrarySongDetailMutationActionCommand & LibrarySongDetailMutationHapticCommand;

type LibrarySongDetailMutationNavigationCommand =
  LibrarySongDetailMutationHapticCommand & {
    href: LibrarySongDetailHref;
  };

export const getLibrarySongDetailMutationBlockedCommand =
  (): LibrarySongDetailMutationHapticCommand => ({
    haptic: "error",
  });

export const getLibrarySongDetailMutationStartCommand = (
  mutation: LibrarySongDetailMutationKind,
): LibrarySongDetailMutationActionCommand => ({
  action: {
    mutation,
    type: "begin",
  },
});

export const getLibrarySongDetailMutationFinishCommand = (
  mutation: LibrarySongDetailMutationKind,
): LibrarySongDetailMutationActionCommand => ({
  action: {
    mutation,
    type: "finish",
  },
});

export const getLibrarySongDeleteSuccessCommand =
  (): LibrarySongDetailMutationNavigationCommand => ({
    haptic: "success",
    href: getLibrarySongDeleteSuccessHref(),
  });

export const getLibrarySongExportSuccessCommand =
  (): LibrarySongDetailMutationHapticCommand => ({
    haptic: "success",
  });

export const getLibrarySongLikedSuccessCommand =
  (): LibrarySongDetailMutationHapticCommand => ({
    haptic: "light",
  });

export const getLibrarySongDetailMutationFailureCommand = ({
  caughtError,
  mutation,
}: {
  caughtError: unknown;
  mutation: LibrarySongDetailMutationKind;
}): LibrarySongDetailMutationFailureCommand => ({
  action: {
    error: getLibrarySongDetailMutationErrorMessage({
      caughtError,
      mutation,
    }),
    type: "fail",
  },
  haptic: "error",
});
