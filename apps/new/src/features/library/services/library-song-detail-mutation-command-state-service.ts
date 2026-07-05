import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import {
  getLibrarySongDeleteSuccessHref,
  type LibrarySongDetailHref,
} from "./library-song-navigation-service";
import type {
  LibrarySongDetailMutationAction,
  LibrarySongDetailMutationKind,
} from "./library-song-detail-mutation-service";
import { getLibrarySongDetailMutationErrorMessage } from "./library-song-detail-mutation-error-service";

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
