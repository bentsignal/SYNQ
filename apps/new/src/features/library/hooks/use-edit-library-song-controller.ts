import { useEffect, useReducer } from "react";
import { router } from "expo-router";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { pickCollectionImage } from "../services/collection-image-picker-service";
import { updateLibrarySongMetadataCommand } from "../services/library-song-command-service";
import {
  getLibrarySongEditBlockedCommand,
  getLibrarySongEditCoverPickedCommand,
  getLibrarySongEditFailureCommand,
  getLibrarySongEditSaveSuccessCommand,
  getInitialLibrarySongEditControllerState,
  librarySongEditControllerReducer,
} from "../services/library-song-form-service";
import { getLibrarySongEditActionState } from "../services/library-song-edit-screen-state-service";
import { type LibrarySongDetail } from "../services/library-song-detail-service";

type UseEditLibrarySongControllerParams = {
  detail: LibrarySongDetail;
  songId: number;
};

export function useEditLibrarySongController({
  detail,
  songId,
}: UseEditLibrarySongControllerParams) {
  const { sendHaptic } = useHapticFeedback();
  const [formState, dispatchFormState] = useReducer(
    librarySongEditControllerReducer,
    undefined,
    getInitialLibrarySongEditControllerState,
  );
  const actionState = getLibrarySongEditActionState({
    detail,
    isSaving: formState.isSaving,
    title: formState.title,
  });

  useEffect(() => {
    dispatchFormState({ detail, songId, type: "hydrate" });
  }, [detail, songId]);

  const updateField =
    (field: "albumNames" | "artistNames" | "title") => (value: string) => {
      dispatchFormState({ field, type: "change-field", value });
    };

  const pickCoverImage = async () => {
    if (!actionState.canPickCoverImage) {
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
    if (!actionState.canSave) {
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
      router.replace(command.href);
    } catch (caughtError) {
      const command = getLibrarySongEditFailureCommand(caughtError);
      sendHaptic(command.haptic);
      dispatchFormState(command.action);
    } finally {
      dispatchFormState({ type: "finish-save" });
    }
  };

  return {
    actionState,
    albumNames: formState.albumNames,
    artistNames: formState.artistNames,
    coverImage: formState.coverImage,
    errorMessage: formState.errorMessage,
    pickCoverImage,
    save,
    setAlbumNames: updateField("albumNames"),
    setArtistNames: updateField("artistNames"),
    setTitle: updateField("title"),
    title: formState.title,
  };
}
