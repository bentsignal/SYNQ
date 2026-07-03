import { useLocalSearchParams } from "expo-router";
import { parseNumericRouteParam } from "@/src/features/app-shell/services/route-param-service";
import { AddCollectionSongsConnectedForm } from "../components/AddCollectionSongsConnectedForm";
import { LibraryInvalidCollectionState } from "../components/LibraryInvalidCollectionState";
import { useAddCollectionSongsSearchQuery } from "../hooks/use-add-collection-songs-search-query";
import {
  useAddableAlbumCollectionSongsQuery,
  useAddableArtistCollectionSongsQuery,
  useAddablePlaylistCollectionSongsQuery,
} from "../hooks/use-addable-collection-songs-query";
import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";

type AddCollectionSongsScreenProps = {
  kind: LibraryCollectionDetailKind;
};

export function AddCollectionSongsScreen({
  kind,
}: AddCollectionSongsScreenProps) {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = parseNumericRouteParam(params.id);

  if (id === null) {
    return <LibraryInvalidCollectionState />;
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
    <AddCollectionSongsConnectedForm
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
    <AddCollectionSongsConnectedForm
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
    <AddCollectionSongsConnectedForm
      addable={addable}
      collectionId={id}
      kind="playlist"
      onChangeQuery={setQuery}
      query={query}
    />
  );
}
