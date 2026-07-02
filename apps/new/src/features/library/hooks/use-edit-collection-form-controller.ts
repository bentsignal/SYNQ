import type { EditCollectionKind } from "../services/edit-collection-query-service";
import { useCollectionFormStateController } from "./use-collection-form-state-controller";
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
    hydrateFrom: collection,
    isMissing: collection.isMissing,
    saveLabel: copy.editLabel,
    savingLabel: "Saving",
  });

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
    updateName,
    updateYear,
    year: formState.year,
  };
}
