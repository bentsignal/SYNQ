import {
  getEditCollectionFormSubtitle,
  getSavedCollectionFormImageLabel,
  type CollectionFormActionState,
} from "../services/collection-form-service";
import type { EditCollectionKind } from "../services/edit-collection-query-service";
import { CollectionFormView } from "./CollectionFormView";
import type { CollectionFormImage } from "./collection-form-types";

type EditCollectionFormCopy = {
  kicker: string;
  namePlaceholder: string;
  title: string;
};

type EditCollectionFormViewProps = {
  actionState: CollectionFormActionState;
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
  onChangeName: (name: string) => void;
  onChangeYear: (year: string) => void;
  onPickImage: () => void;
  onSave: () => void;
  saveLabel: string;
  year: string;
};

export function EditCollectionFormView({
  actionState,
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
  onChangeName,
  onChangeYear,
  onPickImage,
  onSave,
  saveLabel,
  year,
}: EditCollectionFormViewProps) {
  return (
    <CollectionFormView
      actionState={actionState}
      copy={copy}
      errorMessages={[
        collectionIsMissing && "Collection not found.",
        collectionError && "Collection query failed.",
        error,
      ]}
      image={image}
      imageFallbackName={
        collectionImagePath ? getSavedCollectionFormImageLabel(kind) : null
      }
      imageFallbackUri={collectionImagePath}
      imageInitial={imageInitial}
      isSaving={isSaving}
      kind={kind}
      name={name}
      onChangeName={onChangeName}
      onChangeYear={onChangeYear}
      onPickImage={onPickImage}
      onSave={onSave}
      saveLabel={saveLabel}
      subtitle={getEditCollectionFormSubtitle()}
      year={year}
    />
  );
}
