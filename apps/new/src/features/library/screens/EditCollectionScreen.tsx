import { useNumericRouteParam } from "@/src/features/app-shell/hooks/use-numeric-route-param";
import { EditCollectionConnectedForm } from "../components/EditCollectionConnectedForm";
import { LibraryInvalidCollectionState } from "../components/LibraryInvalidCollectionState";
import {
  useEditAlbumCollectionQuery,
  useEditArtistCollectionQuery,
  useEditPlaylistCollectionQuery,
} from "../hooks/use-edit-collection-query";
import { getEditCollectionFormCopy } from "../services/collection-form-copy-service";
import { getLibraryInvalidCollectionState } from "../services/library-collection-navigation-service";
import type { EditCollectionKind } from "../services/edit-collection-state-service";

export type CollectionKind = EditCollectionKind;

type EditCollectionScreenProps = {
  kind: CollectionKind;
};

export function EditCollectionScreen({ kind }: EditCollectionScreenProps) {
  const id = useNumericRouteParam();
  const copy = getEditCollectionFormCopy(kind);

  if (id === null) {
    return (
      <LibraryInvalidCollectionState
        state={getLibraryInvalidCollectionState({ kicker: copy.kicker })}
      />
    );
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

  return (
    <EditCollectionConnectedForm
      collection={collection}
      copy={getEditCollectionFormCopy("album")}
      id={id}
      kind="album"
    />
  );
}

function EditArtistCollectionContent({ id }: { id: number }) {
  const collection = useEditArtistCollectionQuery({ id });

  return (
    <EditCollectionConnectedForm
      collection={collection}
      copy={getEditCollectionFormCopy("artist")}
      id={id}
      kind="artist"
    />
  );
}

function EditPlaylistCollectionContent({ id }: { id: number }) {
  const collection = useEditPlaylistCollectionQuery({ id });

  return (
    <EditCollectionConnectedForm
      collection={collection}
      copy={getEditCollectionFormCopy("playlist")}
      id={id}
      kind="playlist"
    />
  );
}
