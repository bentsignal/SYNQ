import { useEffect, useReducer } from "react";
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
  collectionFormReducer,
  getCollectionDetailHref,
  getCollectionFormActionState,
  getCollectionFormErrorMessage,
  getCollectionFormPreviewInitial,
  getCollectionFormSaveLabel,
  getInitialCollectionFormState,
} from "../services/collection-form-service";
import type { EditCollectionKind } from "../services/edit-collection-query-service";

type EditCollectionFormCopy = {
  editLabel: string;
  kicker: string;
};

type EditCollectionQueryState = {
  imagePath: string | null;
  isMissing: boolean;
  name: string;
  updatedAt: Date | undefined;
  year: string;
};

type UseEditCollectionFormControllerParams = {
  collection: EditCollectionQueryState;
  copy: EditCollectionFormCopy;
  id: number;
  kind: EditCollectionKind;
};

export function useEditCollectionFormController({
  collection,
  copy,
  id,
  kind,
}: UseEditCollectionFormControllerParams) {
  const router = useRouter();
  const { sendHaptic } = useHapticFeedback();
  const [formState, dispatchFormState] = useReducer(
    collectionFormReducer,
    undefined,
    getInitialCollectionFormState,
  );
  const actionState = getCollectionFormActionState({
    isMissing: collection.isMissing,
    isSaving: formState.isSaving,
    name: formState.name,
  });
  const imageInitial = getCollectionFormPreviewInitial({
    fallback: copy.kicker[0],
    name: formState.name,
  });
  const saveLabel = getCollectionFormSaveLabel({
    defaultLabel: copy.editLabel,
    isSaving: formState.isSaving,
    savingLabel: "Saving",
  });

  useEffect(() => {
    if (!collection.updatedAt) {
      return;
    }

    dispatchFormState({
      name: collection.name,
      type: "hydrate",
      year: collection.year,
    });
  }, [collection.name, collection.updatedAt, collection.year]);

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

  const save = async () => {
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
    actionState,
    error: formState.error,
    image: formState.image,
    imageInitial,
    isSaving: formState.isSaving,
    name: formState.name,
    pickImage,
    save,
    saveLabel,
    updateName: updateField("name"),
    updateYear: updateField("year"),
    year: formState.year,
  };
}
