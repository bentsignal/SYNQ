import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import {
  type CollectionDetailMutationAction,
  type CollectionDetailMutationKind,
} from "./library-collection-mutation-state-service";
import { getCollectionDetailMutationErrorMessage } from "./library-collection-mutation-error-copy-service";

type CollectionDetailMutationActionCommand = {
  action: CollectionDetailMutationAction;
};

type CollectionDetailMutationHapticCommand = {
  haptic: HapticFeedbackType;
};

type CollectionDetailMutationFailureCommand =
  CollectionDetailMutationActionCommand & CollectionDetailMutationHapticCommand;

export const getCollectionDetailMutationBlockedCommand =
  (): CollectionDetailMutationHapticCommand => ({
    haptic: "error",
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
