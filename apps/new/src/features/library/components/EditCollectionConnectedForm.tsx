import { useEditCollectionFormController } from "../hooks/use-edit-collection-form-controller";
import type { EditCollectionQueryResult } from "../hooks/use-edit-collection-query";
import {
  getEditCollectionFormPresentationState,
} from "../services/collection-form-controller-view-state-service";
import type { EditCollectionKind } from "../services/edit-collection-state-service";
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
  const presentationState = getEditCollectionFormPresentationState({
    collectionError: Boolean(collection.error),
    collectionImagePath: collection.imagePath,
    collectionIsMissing: collection.isMissing,
    error,
    kind,
  });

  return (
    <EditCollectionFormView
      actionState={actionState}
      artistNames={artistNames}
      copy={copy}
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
      presentationState={presentationState}
      saveLabel={saveLabel}
      year={year}
    />
  );
}
