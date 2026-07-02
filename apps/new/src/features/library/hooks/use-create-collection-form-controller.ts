import { useMemo, useState } from "react";
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
  getCollectionDetailHref,
  getCollectionFormActionState,
  getCollectionFormErrorMessage,
  getCollectionFormPreviewInitial,
  getCollectionFormSaveLabel,
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
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [image, setImage] = useState<{
    dataUrl: string;
    fileName: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const actionState = useMemo(
    () =>
      getCollectionFormActionState({
        isSaving,
        name,
      }),
    [isSaving, name],
  );
  const imageInitial = getCollectionFormPreviewInitial({
    fallback: copy.kicker[0],
    name,
  });
  const saveLabel = getCollectionFormSaveLabel({
    defaultLabel: copy.createLabel,
    isSaving,
    savingLabel: "Creating",
  });

  const pickImage = async () => {
    try {
      sendHaptic("light");
      const pickedImage = await pickCollectionImage();
      if (pickedImage) {
        setImage(pickedImage);
      }
    } catch (caughtError) {
      sendHaptic("error");
      setError(
        getCollectionFormErrorMessage({
          caughtError,
          fallbackMessage: "Image could not be selected.",
        }),
      );
    }
  };

  const create = async () => {
    if (!actionState.canSave) {
      sendHaptic("error");
      setError(`${copy.kicker} name is required.`);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const collection = await createCollectionFromForm({
        imageDataUrl: image?.dataUrl,
        kind,
        name,
        repository: {
          createAlbum,
          createArtistWithImage,
          createPlaylist,
        },
        year,
      });
      sendHaptic("success");
      router.replace(getCollectionDetailHref({ id: collection.id, kind }));
    } catch (caughtError) {
      sendHaptic("error");
      setError(
        getCollectionFormErrorMessage({
          caughtError,
          fallbackMessage: `${copy.kicker} could not be created.`,
        }),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return {
    actionState,
    create,
    error,
    image,
    imageInitial,
    isSaving,
    name,
    pickImage,
    saveLabel,
    setName,
    setYear,
    year,
  };
}
