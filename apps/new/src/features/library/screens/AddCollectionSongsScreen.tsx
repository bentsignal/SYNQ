import { useNumericRouteParam } from "@/src/features/app-shell/hooks/use-numeric-route-param";
import { AddCollectionSongsFormView } from "../components/AddCollectionSongsFormView";
import { LibraryInvalidCollectionState } from "../components/LibraryInvalidCollectionState";
import {
  useAddAlbumCollectionSongsConnectedController,
  useAddArtistCollectionSongsConnectedController,
  useAddPlaylistCollectionSongsConnectedController,
} from "../hooks/use-add-collection-songs-connected-controller";
import { getLibraryInvalidCollectionState } from "../services/library-collection-navigation-service";
import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";

type AddCollectionSongsScreenProps = {
  kind: LibraryCollectionDetailKind;
};

export function AddCollectionSongsScreen({
  kind,
}: AddCollectionSongsScreenProps) {
  const id = useNumericRouteParam();

  if (id === null) {
    return (
      <LibraryInvalidCollectionState
        state={getLibraryInvalidCollectionState()}
      />
    );
  }

  return <AddCollectionSongsContent id={id} kind={kind} />;
}

function AddCollectionSongsContent({
  id,
  kind,
}: {
  id: number;
  kind: LibraryCollectionDetailKind;
}) {
  if (kind === "album") {
    return <AddAlbumCollectionSongsContent id={id} />;
  }

  if (kind === "artist") {
    return <AddArtistCollectionSongsContent id={id} />;
  }

  return <AddPlaylistCollectionSongsContent id={id} />;
}

function AddAlbumCollectionSongsContent({ id }: { id: number }) {
  const controller = useAddAlbumCollectionSongsConnectedController({
    collectionId: id,
  });

  return <AddCollectionSongsFormView {...controller} />;
}

function AddArtistCollectionSongsContent({ id }: { id: number }) {
  const controller = useAddArtistCollectionSongsConnectedController({
    collectionId: id,
  });

  return <AddCollectionSongsFormView {...controller} />;
}

function AddPlaylistCollectionSongsContent({ id }: { id: number }) {
  const controller = useAddPlaylistCollectionSongsConnectedController({
    collectionId: id,
  });


  return <AddCollectionSongsFormView {...controller} />;
}
