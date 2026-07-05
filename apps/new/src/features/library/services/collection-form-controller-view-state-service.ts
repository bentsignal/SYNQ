import type { CollectionFormActionState } from "./collection-form-action-state-service";
import {
  getEditCollectionFormSubtitle,
} from "./collection-form-copy-service";
import {
  getSavedCollectionFormImageLabel,
} from "./collection-form-field-state-service";
import { getCollectionFormBackLink } from "./collection-form-navigation-service";
import type { CollectionFormState } from "./collection-form-state-service";
import type { EditCollectionKind } from "./edit-collection-state-service";

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

export const getEditCollectionFormPresentationState = ({
  collectionError,
  collectionImagePath,
  collectionIsMissing,
  error,
  kind,
}: {
  collectionError: boolean;
  collectionImagePath: string | null;
  collectionIsMissing: boolean;
  error: string | null;
  kind: EditCollectionKind;
}) => ({
  backLink: getCollectionFormBackLink(),
  errorMessages: [
    collectionIsMissing && "Collection not found.",
    collectionError && "Collection query failed.",
    error,
  ],
  imageFallbackName: collectionImagePath
    ? getSavedCollectionFormImageLabel(kind)
    : null,
  imageFallbackUri: collectionImagePath,
  subtitle: getEditCollectionFormSubtitle(),
});

export type EditCollectionFormPresentationState = ReturnType<
  typeof getEditCollectionFormPresentationState
>;
