import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import {
  getLibrarySongEditBlockedCommand,
  getLibrarySongEditCoverPickedCommand,
  getLibrarySongEditFailureCommand,
} from "./library-song-form-command-state-service";
import type { LibrarySongEditControllerAction } from "./library-song-edit-controller-reducer-service";
import type { LibrarySongEditCoverImage } from "./library-song-edit-form-state-service";

type LibrarySongEditDispatch = (
  action: LibrarySongEditControllerAction,
) => void;

type HapticSender = (type: HapticFeedbackType) => void;

type LibrarySongCoverPicker = () => Promise<LibrarySongEditCoverImage | null>;

export const runLibrarySongEditCoverPickCommand = async ({
  canPickCoverImage,
  dispatch,
  pickCoverImage,
  sendHaptic,
}: {
  canPickCoverImage: boolean;
  dispatch: LibrarySongEditDispatch;
  pickCoverImage: LibrarySongCoverPicker;
  sendHaptic: HapticSender;
}) => {
  if (!canPickCoverImage) {
    sendHaptic(getLibrarySongEditBlockedCommand().haptic);
    return;
  }

  try {
    const pickedImage = await pickCoverImage();
    if (pickedImage) {
      const command = getLibrarySongEditCoverPickedCommand(pickedImage);
      dispatch(command.action);
      sendHaptic(command.haptic);
    }
  } catch (caughtError) {
    const command = getLibrarySongEditFailureCommand(caughtError);
    sendHaptic(command.haptic);
    dispatch(command.action);
  }
};
