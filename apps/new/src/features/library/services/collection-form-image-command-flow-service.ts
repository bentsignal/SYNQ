import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import {
  getCollectionFormImagePickedCommand,
  getCollectionFormImagePickFailureCommand,
  getCollectionFormImagePickStartCommand,
} from "./collection-form-command-state-service";
import type {
  CollectionFormAction,
  CollectionFormImage,
} from "./collection-form-state-service";

type CollectionFormDispatch = (action: CollectionFormAction) => void;

type HapticSender = (type: HapticFeedbackType) => void;

type CollectionImagePicker = () => Promise<CollectionFormImage | null>;

export const runCollectionFormImagePickCommand = async ({
  dispatch,
  pickImage,
  sendHaptic,
}: {
  dispatch: CollectionFormDispatch;
  pickImage: CollectionImagePicker;
  sendHaptic: HapticSender;
}) => {
  try {
    sendHaptic(getCollectionFormImagePickStartCommand().haptic);
    const pickedImage = await pickImage();
    if (pickedImage) {
      dispatch(getCollectionFormImagePickedCommand(pickedImage).action);
    }
  } catch (caughtError) {
    const command = getCollectionFormImagePickFailureCommand(caughtError);
    sendHaptic(command.haptic);
    dispatch(command.action);
  }
};
