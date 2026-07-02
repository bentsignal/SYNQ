import { useCallback } from "react";
import type { HapticFeedbackType } from "@/src/features/settings/services/haptic-feedback-service";
import { pickCollectionImage } from "../services/collection-image-picker-service";
import {
  getCollectionFormErrorMessage,
  type CollectionFormAction,
} from "../services/collection-form-service";

type CollectionFormDispatch = React.Dispatch<CollectionFormAction>;

export function useCollectionFormImageCommand({
  dispatchFormState,
  sendHaptic,
}: {
  dispatchFormState: CollectionFormDispatch;
  sendHaptic: (type: HapticFeedbackType) => void;
}) {
  return useCallback(async () => {
    try {
      sendHaptic("light");
      const pickedImage = await pickCollectionImage();
      if (pickedImage) {
        dispatchFormState({ image: pickedImage, type: "pick-image" });
      }
    } catch (caughtError) {
      sendHaptic("error");
      dispatchFormState({
        error: getCollectionFormErrorMessage({
          caughtError,
          fallbackMessage: "Image could not be selected.",
        }),
        type: "fail",
      });
    }
  }, [dispatchFormState, sendHaptic]);
}
