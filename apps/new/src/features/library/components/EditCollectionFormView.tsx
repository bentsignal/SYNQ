import type { CollectionFormActionState } from "../services/collection-form-action-state-service";
import {
  getEditCollectionFormPresentationState,
} from "../services/collection-form-controller-view-state-service";
import type { EditCollectionKind } from "../services/edit-collection-state-service";
import { CollectionFormView } from "./CollectionFormView";
import type { CollectionFormImage } from "./collection-form-types";

type EditCollectionFormCopy = {
  kicker: string;
  namePlaceholder: string;
  title: string;
};

type EditCollectionFormViewProps = {
  actionState: CollectionFormActionState;
  artistNames?: string;
  collectionError: boolean;
  collectionImagePath: string | null;
  collectionIsMissing: boolean;
  copy: EditCollectionFormCopy;
  error: string | null;
  image: CollectionFormImage;
  imageInitial: string;
  isSaving: boolean;
  kind: EditCollectionKind;
  name: string;
  onChangeArtistNames?: (artistNames: string) => void;
  onChangeName: (name: string) => void;
  onChangeYear: (year: string) => void;
  onPickImage: () => void;
  onSave: () => void;
  saveLabel: string;
  year: string;
};

export function EditCollectionFormView({
  actionState,
  artistNames,
  collectionError,
  collectionImagePath,
  collectionIsMissing,
  copy,
  error,
  image,
  imageInitial,
  isSaving,
  kind,
  name,
  onChangeArtistNames,
  onChangeName,
  onChangeYear,
  onPickImage,
  onSave,
  saveLabel,
  year,
}: EditCollectionFormViewProps) {
  const presentationState = getEditCollectionFormPresentationState({
    collectionError,
    collectionImagePath,
    collectionIsMissing,
    error,
    kind,
  });

  return (
    <CollectionFormView
      actionState={actionState}
      artistNames={artistNames}
      backLink={presentationState.backLink}
      copy={copy}
      errorMessages={presentationState.errorMessages}
      image={image}
      imageFallbackName={presentationState.imageFallbackName}
      imageFallbackUri={presentationState.imageFallbackUri}
      imageInitial={imageInitial}
      isSaving={isSaving}
      kind={kind}
      name={name}
      onChangeArtistNames={onChangeArtistNames}
      onChangeName={onChangeName}
      onChangeYear={onChangeYear}
      onPickImage={onPickImage}
      onSave={onSave}
      saveLabel={saveLabel}
      subtitle={presentationState.subtitle}
      year={year}
    />
  );
}
