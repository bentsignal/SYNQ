import type { EditCollectionKind } from "../services/edit-collection-state-service";
import { getEditCollectionFormControllerViewState } from "../services/collection-form-controller-view-state-service";
import { useCollectionFormStateController } from "./use-collection-form-state-controller";
import { useEditCollectionFormCommands } from "./use-edit-collection-form-commands";

type EditCollectionFormCopy = {
  editLabel: string;
  kicker: string;
};

type EditCollectionQueryState = {
  artistNames?: string;
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
    updateArtistNames,
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
    dispatchFormState,
    formState,
    id,
    kind,
  });
  const viewState = getEditCollectionFormControllerViewState({
    actionState,
    formState,
    imageInitial,
    saveLabel,
  });

  return {
    ...viewState,
    pickImage,
    save,
    updateArtistNames,
    updateName,
    updateYear,
  };
}
