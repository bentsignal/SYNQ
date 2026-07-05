import type { CollectionFormState } from "./collection-form-state-service";
import { getCollectionFormActionState } from "./collection-form-action-state-service";

export const getCollectionFormPreviewInitial = ({
  fallback,
  name,
}: {
  fallback: string;
  name: string;
}) => name.trim().slice(0, 1).toUpperCase() || fallback;

export const getCollectionFormSaveLabel = ({
  defaultLabel,
  isSaving,
  savingLabel,
}: {
  defaultLabel: string;
  isSaving: boolean;
  savingLabel: string;
}) => (isSaving ? savingLabel : defaultLabel);

export const getCollectionFormControllerResultState = ({
  fallbackInitial,
  formState,
  isMissing,
  saveLabel,
  savingLabel,
}: {
  fallbackInitial: string;
  formState: CollectionFormState;
  isMissing?: boolean;
  saveLabel: string;
  savingLabel: string;
}) => ({
  actionState: getCollectionFormActionState({
    isMissing,
    isSaving: formState.isSaving,
    name: formState.name,
  }),
  imageInitial: getCollectionFormPreviewInitial({
    fallback: fallbackInitial,
    name: formState.name,
  }),
  saveLabel: getCollectionFormSaveLabel({
    defaultLabel: saveLabel,
    isSaving: formState.isSaving,
    savingLabel,
  }),
});

export type CollectionFormControllerResultState = ReturnType<
  typeof getCollectionFormControllerResultState
>;
