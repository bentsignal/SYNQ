import type { CollectionFormActionState } from "../services/collection-form-action-state-service";
import type { EditCollectionFormPresentationState } from "../services/collection-form-controller-view-state-service";
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
  copy: EditCollectionFormCopy;
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
  presentationState: EditCollectionFormPresentationState;
  saveLabel: string;
  year: string;
};

export function EditCollectionFormView({
  actionState,
  artistNames,
  copy,
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
  presentationState,
  saveLabel,
  year,
}: EditCollectionFormViewProps) {
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
