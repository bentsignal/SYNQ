import { type CollectionFormKind } from "../services/collection-form-service";
import { useCreateCollectionFormCommands } from "./use-create-collection-form-commands";
import { useCollectionFormStateController } from "./use-collection-form-state-controller";

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
  const {
    actionState,
    dispatchFormState,
    formState,
    imageInitial,
    saveLabel,
    updateName,
    updateYear,
  } = useCollectionFormStateController({
    fallbackInitial: copy.kicker[0],
    saveLabel: copy.createLabel,
    savingLabel: "Creating",
  });

  const { create, pickImage } = useCreateCollectionFormCommands({
    canSave: actionState.canSave,
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
    setName: updateName,
    setYear: updateYear,
    year: formState.year,
  };
}
