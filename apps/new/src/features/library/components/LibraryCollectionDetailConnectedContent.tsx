import {
  useAlbumCollectionDetailQuery,
  useArtistCollectionDetailQuery,
  usePlaylistCollectionDetailQuery,
} from "../hooks/use-library-collection-detail-query";
import {
  useLibraryCollectionDetailScreenController,
  type LibraryCollectionDetailQueryResult,
} from "../hooks/use-library-collection-detail-screen-controller";
import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";
import { LibraryCollectionDetailView } from "./LibraryCollectionDetailView";

export function LibraryCollectionDetailConnectedContent({
  id,
  kind,
}: {
  id: number;
  kind: LibraryCollectionDetailKind;
}) {
  if (kind === "album") {
    return <AlbumCollectionDetailContent id={id} />;
  }

  if (kind === "artist") {
    return <ArtistCollectionDetailContent id={id} />;
  }

  return <PlaylistCollectionDetailContent id={id} />;
}

function AlbumCollectionDetailContent({ id }: { id: number }) {
  const collection = useAlbumCollectionDetailQuery({ id });

  return (
    <LibraryCollectionDetailConnectedView
      collection={collection}
      id={id}
      kind="album"
    />
  );
}

function ArtistCollectionDetailContent({ id }: { id: number }) {
  const collection = useArtistCollectionDetailQuery({ id });

  return (
    <LibraryCollectionDetailConnectedView
      collection={collection}
      id={id}
      kind="artist"
    />
  );
}

function PlaylistCollectionDetailContent({ id }: { id: number }) {
  const collection = usePlaylistCollectionDetailQuery({ id });

  return (
    <LibraryCollectionDetailConnectedView
      collection={collection}
      id={id}
      kind="playlist"
    />
  );
}

function LibraryCollectionDetailConnectedView({
  collection,
  id,
  kind,
}: {
  collection: LibraryCollectionDetailQueryResult;
  id: number;
  kind: LibraryCollectionDetailKind;
}) {
  const controller = useLibraryCollectionDetailScreenController({
    collection,
    id,
    kind,
  });

  return <LibraryCollectionDetailView {...controller} />;
}
