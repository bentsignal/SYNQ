import { useCallback } from "react";
import type { HapticFeedbackType } from "@/src/features/settings/services/haptic-feedback-service";
import { pickCollectionImage } from "../services/collection-image-picker-service";
import {
  getCollectionFormImagePickedCommand,
  getCollectionFormImagePickFailureCommand,
  getCollectionFormImagePickStartCommand,
} from "../services/collection-form-command-state-service";
import {
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
      sendHaptic(getCollectionFormImagePickStartCommand().haptic);
      const pickedImage = await pickCollectionImage();
      if (pickedImage) {
        dispatchFormState(
          getCollectionFormImagePickedCommand(pickedImage).action,
        );
      }
    } catch (caughtError) {
      const command = getCollectionFormImagePickFailureCommand(caughtError);
      sendHaptic(command.haptic);
      dispatchFormState(command.action);
    }
  }, [dispatchFormState, sendHaptic]);
}
