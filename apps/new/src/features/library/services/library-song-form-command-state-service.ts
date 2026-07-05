import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import {
  getLibrarySongDetailHref,
  type LibrarySongDetailHref,
} from "./library-song-navigation-service";
import type {
  LibrarySongEditControllerAction,
} from "./library-song-edit-controller-action-service";
import type { LibrarySongEditCoverImage } from "./library-song-edit-form-state-service";
import { getLibrarySongEditErrorMessage } from "./library-song-edit-error-service";

type LibrarySongEditHapticCommand = {
  haptic: HapticFeedbackType;
};

type LibrarySongEditActionCommand = LibrarySongEditHapticCommand & {
  action: LibrarySongEditControllerAction;
};

type LibrarySongEditNavigationCommand = LibrarySongEditHapticCommand & {
  href: LibrarySongDetailHref;
};

export const getLibrarySongEditBlockedCommand =
  (): LibrarySongEditHapticCommand => ({
    haptic: "error",
  });

export const getLibrarySongEditCoverPickedCommand = (
  coverImage: LibrarySongEditCoverImage,
): LibrarySongEditActionCommand => ({
  action: {
    coverImage,
    type: "pick-cover-image",
  },
  haptic: "light",
});

export const getLibrarySongEditFailureCommand = (
  caughtError: unknown,
): LibrarySongEditActionCommand => ({
  action: {
    errorMessage: getLibrarySongEditErrorMessage(caughtError),
    type: "fail",
  },
  haptic: "error",
});

export const getLibrarySongEditSaveSuccessCommand = ({
  songId,
}: {
  songId: number;
}): LibrarySongEditNavigationCommand => ({
  haptic: "success",
  href: getLibrarySongDetailHref({ songId }),
});
