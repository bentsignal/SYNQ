import { replaceNativeRoute } from "@/src/features/app-shell/services/native-route-service";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { pickCollectionImage } from "../services/collection-image-picker-service";
import { updateLibrarySongMetadataCommand } from "../services/library-song-command-service";
import type {
  LibrarySongEditControllerAction,
  LibrarySongEditControllerState,
} from "../services/library-song-edit-controller-reducer-service";
import {
  runLibrarySongEditCoverPickCommand,
  runLibrarySongEditSaveCommand,
} from "../services/library-song-form-command-flow-service";

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
    await runLibrarySongEditCoverPickCommand({
      canPickCoverImage,
      dispatch: dispatchFormState,
      pickCoverImage: pickCollectionImage,
      sendHaptic,
    });
  };

  const save = async () => {
    await runLibrarySongEditSaveCommand({
      canSave,
      dispatch: dispatchFormState,
      formState,
      replaceRoute: replaceNativeRoute,
      sendHaptic,
      songId,
      updateLibrarySongMetadata: updateLibrarySongMetadataCommand,
    });
  };

  return {
    pickCoverImage,
    save,
  };
}
