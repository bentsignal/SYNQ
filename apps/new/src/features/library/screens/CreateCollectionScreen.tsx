import { CollectionFormView } from "../components/CollectionFormView";
import { useCreateCollectionFormController } from "../hooks/use-create-collection-form-controller";

type CreateCollectionKind = "album" | "artist" | "playlist";

type CreateCollectionScreenProps = {
  kind: CreateCollectionKind;
};

const labels: Record<
  CreateCollectionKind,
  {
    createLabel: string;
    duplicateNoun: string;
    kicker: string;
    namePlaceholder: string;
    title: string;
  }
> = {
  album: {
    createLabel: "Create album",
    duplicateNoun: "album",
    kicker: "Album",
    namePlaceholder: "Album name",
    title: "Create album",
  },
  artist: {
    createLabel: "Create artist",
    duplicateNoun: "artist",
    kicker: "Artist",
    namePlaceholder: "Artist name",
    title: "Create artist",
  },
  playlist: {
    createLabel: "Create playlist",
    duplicateNoun: "playlist",
    kicker: "Playlist",
    namePlaceholder: "Playlist name",
    title: "Create playlist",
  },
};

export function CreateCollectionScreen({ kind }: CreateCollectionScreenProps) {
  const copy = labels[kind];
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
      subtitle={`Name the ${copy.duplicateNoun}, choose optional artwork, and start organizing your music.`}
      year={year}
    />
  );
}
