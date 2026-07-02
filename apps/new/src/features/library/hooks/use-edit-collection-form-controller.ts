import { useEffect, useReducer } from "react";
import {
  collectionFormReducer,
  getCollectionFormActionState,
  getCollectionFormPreviewInitial,
  getCollectionFormSaveLabel,
  getInitialCollectionFormState,
} from "../services/collection-form-service";
import type { EditCollectionKind } from "../services/edit-collection-query-service";
import { useEditCollectionFormCommands } from "./use-edit-collection-form-commands";

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

  const { pickImage, save } = useEditCollectionFormCommands({
    canSave: actionState.canSave,
    copy,
    dispatchFormState,
    formState,
    id,
    kind,
  });

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
