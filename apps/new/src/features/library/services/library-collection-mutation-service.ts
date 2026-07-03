import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import type { LibraryCollectionDetailKind } from "./library-collection-kind-service";
import {
  getCollectionListHref,
  type LibraryCollectionListHref,
} from "./library-collection-navigation-service";
import {
  getCollectionDetailMutationErrorMessage,
  type CollectionDetailMutationAction,
  type CollectionDetailMutationKind,
} from "./library-collection-mutation-state-service";

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

export const getCollectionExportStartCommand =
  (): CollectionDetailMutationActionCommand => ({
    action: {
      mutation: "export-collection",
      type: "begin",
    },
  });

export const getCollectionExportSuccessCommand =
  (): CollectionDetailMutationHapticCommand => ({
    haptic: "success",
  });

export const getCollectionExportFinishCommand =
  (): CollectionDetailMutationActionCommand => ({
    action: {
      mutation: "export-collection",
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
