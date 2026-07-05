import { useNumericRouteParam } from "@/src/features/app-shell/hooks/use-numeric-route-param";
import { AddCollectionSongsFormView } from "../components/AddCollectionSongsFormView";
import { LibraryInvalidCollectionState } from "../components/LibraryInvalidCollectionState";
import { useAddCollectionSongsFormController } from "../hooks/use-add-collection-songs-form-controller";
import { useAddCollectionSongsSearchQuery } from "../hooks/use-add-collection-songs-search-query";
import type { AddableCollectionSongsQueryResult } from "../hooks/use-addable-collection-songs-query";
import {
  useAddableAlbumCollectionSongsQuery,
  useAddableArtistCollectionSongsQuery,
  useAddablePlaylistCollectionSongsQuery,
} from "../hooks/use-addable-collection-songs-query";
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
  const { query, setQuery } = useAddCollectionSongsSearchQuery();
  const addable = useAddableAlbumCollectionSongsQuery({
    collectionId: id,
    query,
  });

  return (
    <AddCollectionSongsConnectedContent
      addable={addable}
      collectionId={id}
      kind="album"
      onChangeQuery={setQuery}
      query={query}
    />
  );
}

function AddArtistCollectionSongsContent({ id }: { id: number }) {
  const { query, setQuery } = useAddCollectionSongsSearchQuery();
  const addable = useAddableArtistCollectionSongsQuery({
    collectionId: id,
    query,
  });

  return (
    <AddCollectionSongsConnectedContent
      addable={addable}
      collectionId={id}
      kind="artist"
      onChangeQuery={setQuery}
      query={query}
    />
  );
}

function AddPlaylistCollectionSongsContent({ id }: { id: number }) {
  const { query, setQuery } = useAddCollectionSongsSearchQuery();
  const addable = useAddablePlaylistCollectionSongsQuery({
    collectionId: id,
    query,
  });

  return (
    <AddCollectionSongsConnectedContent
      addable={addable}
      collectionId={id}
      kind="playlist"
      onChangeQuery={setQuery}
      query={query}
    />
  );
}

function AddCollectionSongsConnectedContent({
  addable,
  collectionId,
  kind,
  onChangeQuery,
  query,
}: {
  addable: AddableCollectionSongsQueryResult;
  collectionId: number;
  kind: LibraryCollectionDetailKind;
  onChangeQuery: (query: string) => void;
  query: string;
}) {
  const controller = useAddCollectionSongsFormController({
    addable,
    collectionId,
    kind,
    onChangeQuery,
    query,
  });

  return <AddCollectionSongsFormView {...controller} />;
}
