import type { CollectionFormActionState } from "../services/collection-form-service";
import type { EditCollectionKind } from "../services/edit-collection-query-service";
import {
  CollectionFormView,
  type CollectionFormImage,
} from "./CollectionFormView";

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
  const imageLabel = kind === "artist" ? "Profile image" : "Cover image";

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
        collectionImagePath ? `Saved ${imageLabel.toLowerCase()}` : null
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
      subtitle="Update the name, artwork, and details shown across your library."
      year={year}
    />
  );
}
