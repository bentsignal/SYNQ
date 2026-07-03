import { useEditCollectionFormController } from "../hooks/use-edit-collection-form-controller";
import type { EditCollectionQueryResult } from "../hooks/use-edit-collection-query";
import type { EditCollectionKind } from "../services/edit-collection-query-service";
import { EditCollectionFormView } from "./EditCollectionFormView";

type EditCollectionConnectedFormCopy = {
  editLabel: string;
  kicker: string;
  namePlaceholder: string;
  title: string;
};

type EditCollectionConnectedFormProps = {
  collection: EditCollectionQueryResult;
  copy: EditCollectionConnectedFormCopy;
  id: number;
  kind: EditCollectionKind;
};

export function EditCollectionConnectedForm({
  collection,
  copy,
  id,
  kind,
}: EditCollectionConnectedFormProps) {
  const {
    actionState,
    artistNames,
    error,
    image,
    imageInitial,
    isSaving,
    name,
    pickImage,
    save,
    saveLabel,
    updateArtistNames,
    updateName,
    updateYear,
    year,
  } = useEditCollectionFormController({
    collection,
    copy,
    id,
    kind,
  });

  return (
    <EditCollectionFormView
      actionState={actionState}
      artistNames={artistNames}
      collectionError={Boolean(collection.error)}
      collectionImagePath={collection.imagePath}
      collectionIsMissing={collection.isMissing}
      copy={copy}
      error={error}
      image={image}
      imageInitial={imageInitial}
      isSaving={isSaving}
      kind={kind}
      name={name}
      onChangeArtistNames={updateArtistNames}
      onChangeName={updateName}
      onChangeYear={updateYear}
      onPickImage={pickImage}
      onSave={save}
      saveLabel={saveLabel}
      year={year}
    />
  );
}
