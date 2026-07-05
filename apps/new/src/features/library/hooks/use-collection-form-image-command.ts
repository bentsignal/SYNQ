import { useCallback } from "react";
import type { HapticFeedbackType } from "@/src/features/settings/services/haptic-feedback-service";
import { pickCollectionImage } from "../services/collection-image-picker-service";
import { runCollectionFormImagePickCommand } from "../services/collection-form-image-command-flow-service";
import {
  type CollectionFormAction,
} from "../services/collection-form-action-service";

type CollectionFormDispatch = React.Dispatch<CollectionFormAction>;

export function useCollectionFormImageCommand({
  dispatchFormState,
  sendHaptic,
}: {
  dispatchFormState: CollectionFormDispatch;
  sendHaptic: (type: HapticFeedbackType) => void;
}) {
  return useCallback(async () => {
    await runCollectionFormImagePickCommand({
      dispatch: dispatchFormState,
      pickImage: pickCollectionImage,
      sendHaptic,
    });
  }, [dispatchFormState, sendHaptic]);
}
