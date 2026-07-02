import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  updateAlbum,
  updateArtist,
  updatePlaylist,
} from "../repository/collection-repository";
import { pickCollectionImage } from "../services/collection-image-picker-service";
import {
  getCollectionFormActionState,
  getCollectionFormPreviewInitial,
  getCollectionFormSaveLabel,
  parseAlbumYearInput,
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
  const [image, setImage] = useState<{
    dataUrl: string;
    fileName: string;
  } | null>(null);
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const actionState = useMemo(
    () =>
      getCollectionFormActionState({
        isMissing: collection.isMissing,
        isSaving,
        name,
      }),
    [collection.isMissing, isSaving, name],
  );
  const imageInitial = getCollectionFormPreviewInitial({
    fallback: copy.kicker[0],
    name,
  });
  const saveLabel = getCollectionFormSaveLabel({
    defaultLabel: copy.editLabel,
    isSaving,
    savingLabel: "Saving",
  });

  useEffect(() => {
    if (isDirty || !collection.updatedAt) {
      return;
    }

    setName(collection.name);
    setYear(collection.year);
  }, [collection.name, collection.updatedAt, collection.year, isDirty]);

  const updateName = (nextName: string) => {
    setIsDirty(true);
    setName(nextName);
  };

  const updateYear = (nextYear: string) => {
    setIsDirty(true);
    setYear(nextYear);
  };

  const pickImage = async () => {
    try {
      sendHaptic("light");
      const pickedImage = await pickCollectionImage();
      if (pickedImage) {
        setImage(pickedImage);
        setIsDirty(true);
      }
    } catch (caughtError) {
      sendHaptic("error");
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Image could not be selected.",
      );
    }
  };

  const save = async () => {
    if (!actionState.canSave) {
      sendHaptic("error");
      setError(`${copy.kicker} name is required.`);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (kind === "album") {
        await updateAlbum({
          coverImage: image?.dataUrl,
          id,
          name,
          year: parseAlbumYearInput(year) ?? null,
        });
        sendHaptic("success");
        router.replace(`/(tabs)/library/album/${id}`);
        return;
      }

      if (kind === "artist") {
        await updateArtist({
          id,
          name,
          profileImage: image?.dataUrl,
        });
        sendHaptic("success");
        router.replace(`/(tabs)/library/artist/${id}`);
        return;
      }

      await updatePlaylist({
        coverImage: image?.dataUrl,
        id,
        name,
      });
      sendHaptic("success");
      router.replace(`/(tabs)/library/playlist/${id}`);
    } catch (caughtError) {
      sendHaptic("error");
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : `${copy.kicker} could not be updated.`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  return {
    actionState,
    error,
    image,
    imageInitial,
    isSaving,
    name,
    pickImage,
    save,
    saveLabel,
    updateName,
    updateYear,
    year,
  };
}
