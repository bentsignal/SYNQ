import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import {
  getLibrarySongDeleteSuccessHref,
  type LibrarySongDetailHref,
} from "./library-song-navigation-service";
import type {
  LibrarySongDetailMutationAction,
  LibrarySongDetailMutationKind,
} from "./library-song-detail-mutation-service";

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
