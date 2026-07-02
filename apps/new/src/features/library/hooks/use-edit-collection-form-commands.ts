import { useRouter } from "expo-router";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  updateAlbum,
  updateArtist,
  updatePlaylist,
} from "../repository/collection-repository";
import { pickCollectionImage } from "../services/collection-image-picker-service";
import { updateCollectionFromForm } from "../services/collection-form-mutation-service";
import {
  getCollectionDetailHref,
  getCollectionFormErrorMessage,
  type CollectionFormAction,
  type CollectionFormState,
} from "../services/collection-form-service";
import type { EditCollectionKind } from "../services/edit-collection-query-service";

type EditCollectionFormCommandsCopy = {
  kicker: string;
};

type UseEditCollectionFormCommandsParams = {
  canSave: boolean;
  copy: EditCollectionFormCommandsCopy;
  dispatchFormState: React.Dispatch<CollectionFormAction>;
  formState: CollectionFormState;
  id: number;
  kind: EditCollectionKind;
};

export function useEditCollectionFormCommands({
  canSave,
  copy,
  dispatchFormState,
  formState,
  id,
  kind,
}: UseEditCollectionFormCommandsParams) {
  const router = useRouter();
  const { sendHaptic } = useHapticFeedback();

  const pickImage = async () => {
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
  };

  const save = async () => {
    if (!canSave) {
      sendHaptic("error");
      dispatchFormState({
        error: `${copy.kicker} name is required.`,
        type: "fail",
      });
      return;
    }

    dispatchFormState({ type: "begin-save" });

    try {
      await updateCollectionFromForm({
        id,
        imageDataUrl: formState.image?.dataUrl,
        kind,
        name: formState.name,
        repository: {
          updateAlbum,
          updateArtist,
          updatePlaylist,
        },
        year: formState.year,
      });
      sendHaptic("success");
      router.replace(getCollectionDetailHref({ id, kind }));
    } catch (caughtError) {
      sendHaptic("error");
      dispatchFormState({
        error: getCollectionFormErrorMessage({
          caughtError,
          fallbackMessage: `${copy.kicker} could not be updated.`,
        }),
        type: "fail",
      });
    } finally {
      dispatchFormState({ type: "finish-save" });
    }
  };

  return {
    pickImage,
    save,
  };
}
