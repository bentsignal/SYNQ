import type { CollectionFormActionState } from "./collection-form-action-state-service";
import type { CollectionFormState } from "./collection-form-state-service";

type CollectionFormControllerViewStateParams = {
  actionState: CollectionFormActionState;
  formState: CollectionFormState;
  imageInitial: string;
  saveLabel: string;
};

export const getCreateCollectionFormControllerViewState = ({
  actionState,
  formState,
  imageInitial,
  saveLabel,
}: CollectionFormControllerViewStateParams) => ({
  actionState,
  error: formState.error,
  image: formState.image,
  imageInitial,
  isSaving: formState.isSaving,
  name: formState.name,
  saveLabel,
  year: formState.year,
});

export type CreateCollectionFormControllerViewState = ReturnType<
  typeof getCreateCollectionFormControllerViewState
>;

export const getEditCollectionFormControllerViewState = ({
  actionState,
  formState,
  imageInitial,
  saveLabel,
}: CollectionFormControllerViewStateParams) => ({
  ...getCreateCollectionFormControllerViewState({
    actionState,
    formState,
    imageInitial,
    saveLabel,
  }),
  artistNames: formState.artistNames,
});

export type EditCollectionFormControllerViewState = ReturnType<
  typeof getEditCollectionFormControllerViewState
>;
