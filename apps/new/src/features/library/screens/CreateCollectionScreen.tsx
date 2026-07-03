import { CollectionFormView } from "../components/CollectionFormView";
import { useCreateCollectionFormController } from "../hooks/use-create-collection-form-controller";
import type { CollectionFormKind } from "../services/collection-form-domain-service";
import {
  getCreateCollectionFormCopy,
  getCreateCollectionFormSubtitle,
} from "../services/collection-form-copy-service";

type CreateCollectionKind = CollectionFormKind;

type CreateCollectionScreenProps = {
  kind: CreateCollectionKind;
};

export function CreateCollectionScreen({ kind }: CreateCollectionScreenProps) {
  const copy = getCreateCollectionFormCopy(kind);
  const {
    actionState,
    create,
    error,
    image,
    imageInitial,
    isSaving,
    name,
    pickImage,
    saveLabel,
    setName,
    setYear,
    year,
  } = useCreateCollectionFormController({ copy, kind });

  return (
    <CollectionFormView
      actionState={actionState}
      copy={copy}
      errorMessages={[error]}
      image={image}
      imageInitial={imageInitial}
      isSaving={isSaving}
      kind={kind}
      name={name}
      onChangeName={setName}
      onChangeYear={setYear}
      onPickImage={pickImage}
      onSave={create}
      saveLabel={saveLabel}
      subtitle={getCreateCollectionFormSubtitle(copy)}
      year={year}
    />
  );
}
