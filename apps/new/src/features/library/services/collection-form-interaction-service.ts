import type { CollectionFormKind } from "./collection-form-domain-service";
import type { CollectionFormState } from "./collection-form-state-service";

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

export const getCollectionFormImageLabel = (kind: CollectionFormKind) =>
  kind === "artist" ? "Profile image" : "Cover image";

export const getSavedCollectionFormImageLabel = (
  kind: CollectionFormKind,
) => `Saved ${getCollectionFormImageLabel(kind).toLowerCase()}`;

export const getCollectionFormFieldState = (kind: CollectionFormKind) => {
  const showsYear = kind === "album";

  return {
    artistNamesPlaceholder: "Artist names",
    artistNamesReturnKeyType: "done",
    nameReturnKeyType: showsYear ? "next" : "done",
    showsArtistNames: kind === "album",
    showsYear,
    yearPlaceholder: "Album year",
    yearReturnKeyType: "done",
  } as const;
};

export const getCollectionFormActionState = ({
  isMissing = false,
  isSaving,
  name,
}: {
  isMissing?: boolean;
  isSaving: boolean;
  name: string;
}) => {
  const hasName = name.trim().length > 0;
  const canEdit = !isSaving && !isMissing;
  const canSave = hasName && canEdit;

  return {
    canEdit,
    canPickImage: canEdit,
    canSave,
    hasName,
  };
};

export type CollectionFormActionState = ReturnType<
  typeof getCollectionFormActionState
>;

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
