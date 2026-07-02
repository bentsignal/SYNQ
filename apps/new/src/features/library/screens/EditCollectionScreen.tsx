import { useLocalSearchParams } from "expo-router";
import { parseNumericRouteParam } from "@/src/features/app-shell/services/route-param-service";
import { EditCollectionFormView } from "../components/EditCollectionFormView";
import { LibraryInvalidCollectionState } from "../components/LibraryInvalidCollectionState";
import { useEditCollectionFormController } from "../hooks/use-edit-collection-form-controller";
import {
  useEditAlbumCollectionQuery,
  useEditArtistCollectionQuery,
  useEditPlaylistCollectionQuery,
} from "../hooks/use-edit-collection-query";
import type { EditCollectionKind } from "../services/edit-collection-query-service";

export type CollectionKind = EditCollectionKind;

type EditCollectionScreenProps = {
  kind: CollectionKind;
};

const labels: Record<
  CollectionKind,
  {
    editLabel: string;
    kicker: string;
    namePlaceholder: string;
    title: string;
  }
> = {
  album: {
    editLabel: "Save album",
    kicker: "Album",
    namePlaceholder: "Album name",
    title: "Edit album",
  },
  artist: {
    editLabel: "Save artist",
    kicker: "Artist",
    namePlaceholder: "Artist name",
    title: "Edit artist",
  },
  playlist: {
    editLabel: "Save playlist",
    kicker: "Playlist",
    namePlaceholder: "Playlist name",
    title: "Edit playlist",
  },
};

export function EditCollectionScreen({ kind }: EditCollectionScreenProps) {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = parseNumericRouteParam(params.id);

  if (id === null) {
    return <LibraryInvalidCollectionState kicker={labels[kind].kicker} />;
  }

  return <EditCollectionContent id={id} kind={kind} />;
}

function EditCollectionContent({
  id,
  kind,
}: {
  id: number;
  kind: CollectionKind;
}) {
  if (kind === "album") {
    return <EditAlbumCollectionContent id={id} />;
  }

  if (kind === "artist") {
    return <EditArtistCollectionContent id={id} />;
  }

  return <EditPlaylistCollectionContent id={id} />;
}

function EditAlbumCollectionContent({ id }: { id: number }) {
  const collection = useEditAlbumCollectionQuery({ id });

  return <EditCollectionForm id={id} kind="album" collection={collection} />;
}

function EditArtistCollectionContent({ id }: { id: number }) {
  const collection = useEditArtistCollectionQuery({ id });

  return <EditCollectionForm id={id} kind="artist" collection={collection} />;
}

function EditPlaylistCollectionContent({ id }: { id: number }) {
  const collection = useEditPlaylistCollectionQuery({ id });

  return <EditCollectionForm id={id} kind="playlist" collection={collection} />;
}

type EditCollectionFormProps = {
  collection: ReturnType<typeof useEditAlbumCollectionQuery>;
  id: number;
  kind: CollectionKind;
};

function EditCollectionForm({
  collection,
  id,
  kind,
}: EditCollectionFormProps) {
  const copy = labels[kind];
  const {
    actionState,
    error,
    image,
    imageInitial,
    isSaving,
    name,
    pickImage,
    save,
    saveLabel,
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
      onChangeName={updateName}
      onChangeYear={updateYear}
      onPickImage={pickImage}
      onSave={save}
      saveLabel={saveLabel}
      year={year}
    />
  );
}
