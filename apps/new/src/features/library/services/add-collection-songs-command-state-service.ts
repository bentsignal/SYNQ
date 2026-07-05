import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import { getAddCollectionSongsMutationErrorMessage } from "./add-collection-songs-error-service";
import type {
  AddCollectionSongsControllerAction,
  AddCollectionSongsMutationKind,
} from "./add-collection-songs-state-service";

type AddCollectionSongsHapticCommand = {
  haptic: HapticFeedbackType;
};

type AddCollectionSongsActionCommand = AddCollectionSongsHapticCommand & {
  action: AddCollectionSongsControllerAction;
};

export const getAddCollectionSongsBlockedCommand =
  (): AddCollectionSongsHapticCommand => ({
    haptic: "error",
  });

export const getAddCollectionSongsToggleSelectionCommand = (
  songId: number,
): AddCollectionSongsActionCommand => ({
  action: {
    songId,
    type: "toggle-selection",
  },
  haptic: "light",
});

export const getAddCollectionSongsSelectionStartCommand =
  (): AddCollectionSongsActionCommand => ({
    action: {
      type: "begin-add-selection",
    },
    haptic: "medium",
  });

export const getAddCollectionSongsSelectionSuccessCommand =
  (): AddCollectionSongsActionCommand => ({
    action: {
      type: "clear-selection",
    },
    haptic: "success",
  });

export const getAddCollectionSongsSongStartCommand = (
  songId: number,
): AddCollectionSongsActionCommand => ({
  action: {
    songId,
    type: "begin-add-song",
  },
  haptic: "light",
});

export const getAddCollectionSongsSongSuccessCommand = (
  songId: number,
): AddCollectionSongsActionCommand => ({
  action: {
    songId,
    type: "remove-selection",
  },
  haptic: "success",
});

export const getAddCollectionSongsFailureCommand = ({
  caughtError,
  mutation,
}: {
  caughtError: unknown;
  mutation: AddCollectionSongsMutationKind;
}): AddCollectionSongsActionCommand => ({
  action: {
    error: getAddCollectionSongsMutationErrorMessage({
      caughtError,
      mutation,
    }),
    type: "fail",
  },
  haptic: "error",
});
