import { useReducer } from "react";
import {
  collectionFormReducer,
  getCollectionFormActionState,
  getCollectionFormPreviewInitial,
  getCollectionFormSaveLabel,
  getInitialCollectionFormState,
  type CollectionFormKind,
} from "../services/collection-form-service";
import { useCreateCollectionFormCommands } from "./use-create-collection-form-commands";

type CreateCollectionKind = CollectionFormKind;

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

  const { create, pickImage } = useCreateCollectionFormCommands({
    canSave: actionState.canSave,
    copy,
    dispatchFormState,
    formState,
    kind,
  });

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
