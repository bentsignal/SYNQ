import { useReducer } from "react";
import { useRouter } from "expo-router";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  createAlbum,
  createArtistWithImage,
  createPlaylist,
} from "../repository/collection-repository";
import { pickCollectionImage } from "../services/collection-image-picker-service";
import { createCollectionFromForm } from "../services/collection-form-mutation-service";
import {
  collectionFormReducer,
  getCollectionDetailHref,
  getCollectionFormActionState,
  getCollectionFormErrorMessage,
  getCollectionFormPreviewInitial,
  getCollectionFormSaveLabel,
  getInitialCollectionFormState,
} from "../services/collection-form-service";

type CreateCollectionKind = "album" | "artist" | "playlist";

type CreateCollectionFormCopy = {
  createLabel: string;
  kicker: string;
};

type UseCreateCollectionFormControllerParams = {
  copy: CreateCollectionFormCopy;
  kind: CreateCollectionKind;
};

export function useCreateCollectionFormController({
  copy,
  kind,
}: UseCreateCollectionFormControllerParams) {
  const router = useRouter();
  const { sendHaptic } = useHapticFeedback();
  const [formState, dispatchFormState] = useReducer(
    collectionFormReducer,
    undefined,
    getInitialCollectionFormState,
  );
  const actionState = getCollectionFormActionState({
    isSaving: formState.isSaving,
    name: formState.name,
  });
  const imageInitial = getCollectionFormPreviewInitial({
    fallback: copy.kicker[0],
    name: formState.name,
  });
  const saveLabel = getCollectionFormSaveLabel({
    defaultLabel: copy.createLabel,
    isSaving: formState.isSaving,
    savingLabel: "Creating",
  });
  const updateField =
    (field: "name" | "year") => (value: string) => {
      dispatchFormState({ field, type: "change-field", value });
    };

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

  const create = async () => {
    if (!actionState.canSave) {
      sendHaptic("error");
      dispatchFormState({
        error: `${copy.kicker} name is required.`,
        type: "fail",
      });
      return;
    }

    dispatchFormState({ type: "begin-save" });

    try {
      const collection = await createCollectionFromForm({
        imageDataUrl: formState.image?.dataUrl,
        kind,
        name: formState.name,
        repository: {
          createAlbum,
          createArtistWithImage,
          createPlaylist,
        },
        year: formState.year,
      });
      sendHaptic("success");
      router.replace(getCollectionDetailHref({ id: collection.id, kind }));
    } catch (caughtError) {
      sendHaptic("error");
      dispatchFormState({
        error: getCollectionFormErrorMessage({
          caughtError,
          fallbackMessage: `${copy.kicker} could not be created.`,
        }),
        type: "fail",
      });
    } finally {
      dispatchFormState({ type: "finish-save" });
    }
  };

  return {
    actionState,
    create,
    error: formState.error,
    image: formState.image,
    imageInitial,
    isSaving: formState.isSaving,
    name: formState.name,
    pickImage,
    saveLabel,
    setName: updateField("name"),
    setYear: updateField("year"),
    year: formState.year,
  };
}
