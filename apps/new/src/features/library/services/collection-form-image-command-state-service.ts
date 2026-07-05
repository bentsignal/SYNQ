import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import type {
  CollectionFormAction,
  CollectionFormImage,
} from "./collection-form-action-service";
import { getCollectionFormErrorMessage } from "./collection-form-service";

type CollectionFormImageHapticCommand = {
  haptic: HapticFeedbackType;
};

type CollectionFormImageActionCommand = CollectionFormImageHapticCommand & {
  action: CollectionFormAction;
};

export const getCollectionFormImagePickStartCommand =
  (): CollectionFormImageHapticCommand => ({
    haptic: "light",
  });

export const getCollectionFormImagePickedCommand = (
  image: CollectionFormImage,
): Pick<CollectionFormImageActionCommand, "action"> => ({
  action: {
    image,
    type: "pick-image",
  },
});

export const getCollectionFormImagePickFailureCommand = (
  caughtError: unknown,
): CollectionFormImageActionCommand => ({
  action: {
    error: getCollectionFormErrorMessage({
      caughtError,
      fallbackMessage: "Image could not be selected.",
    }),
    type: "fail",
  },
  haptic: "error",
});
