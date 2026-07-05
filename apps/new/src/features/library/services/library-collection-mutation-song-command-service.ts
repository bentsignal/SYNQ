import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import type { CollectionDetailMutationAction } from "./library-collection-mutation-state-service";

type CollectionDetailMutationActionCommand = {
  action: CollectionDetailMutationAction;
};

type CollectionDetailMutationHapticCommand = {
  haptic: HapticFeedbackType;
};

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
