import { replaceNativeRoute } from "@/src/features/app-shell/services/native-route-service";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { pickCollectionImage } from "../services/collection-image-picker-service";
import { updateLibrarySongMetadataCommand } from "../services/library-song-command-service";
import type {
  LibrarySongEditControllerAction,
  LibrarySongEditControllerState,
} from "../services/library-song-form-service";
import {
  getLibrarySongEditBlockedCommand,
  getLibrarySongEditCoverPickedCommand,
  getLibrarySongEditFailureCommand,
  getLibrarySongEditSaveSuccessCommand,
} from "../services/library-song-form-command-state-service";

type UseEditLibrarySongCommandsParams = {
  canPickCoverImage: boolean;
  canSave: boolean;
  dispatchFormState: React.Dispatch<LibrarySongEditControllerAction>;
  formState: LibrarySongEditControllerState;
  songId: number;
};

export function useEditLibrarySongCommands({
  canPickCoverImage,
  canSave,
  dispatchFormState,
  formState,
  songId,
}: UseEditLibrarySongCommandsParams) {
  const { sendHaptic } = useHapticFeedback();

  const pickCoverImage = async () => {
    if (!canPickCoverImage) {
      const command = getLibrarySongEditBlockedCommand();
      sendHaptic(command.haptic);
      return;
    }

    try {
      const pickedImage = await pickCollectionImage();
      if (pickedImage) {
        const command = getLibrarySongEditCoverPickedCommand(pickedImage);
        dispatchFormState(command.action);
        sendHaptic(command.haptic);
      }
    } catch (caughtError) {
      const command = getLibrarySongEditFailureCommand(caughtError);
      sendHaptic(command.haptic);
      dispatchFormState(command.action);
    }
  };

  const save = async () => {
    if (!canSave) {
      const command = getLibrarySongEditBlockedCommand();
      sendHaptic(command.haptic);
      return;
    }

    dispatchFormState({ type: "begin-save" });

    try {
      await updateLibrarySongMetadataCommand({
        albumNames: formState.albumNames,
        artistNames: formState.artistNames,
        coverImageDataUrl: formState.coverImage?.dataUrl,
        id: songId,
        title: formState.title,
      });
      const command = getLibrarySongEditSaveSuccessCommand({ songId });
      sendHaptic(command.haptic);
      replaceNativeRoute(command.href);
    } catch (caughtError) {
      const command = getLibrarySongEditFailureCommand(caughtError);
      sendHaptic(command.haptic);
      dispatchFormState(command.action);
    } finally {
      dispatchFormState({ type: "finish-save" });
    }
  };

  return {
    pickCoverImage,
    save,
  };
}
