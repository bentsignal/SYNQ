import { useNumericRouteParam } from "@/src/features/app-shell/hooks/use-numeric-route-param";
import { LibraryCollectionDetailView } from "../components/LibraryCollectionDetailView";
import { LibraryInvalidCollectionState } from "../components/LibraryInvalidCollectionState";
import {
  useAlbumCollectionDetailQuery,
  useArtistCollectionDetailQuery,
  usePlaylistCollectionDetailQuery,
} from "../hooks/use-library-collection-detail-query";
import { getLibraryInvalidCollectionState } from "../services/library-collection-navigation-service";
import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";

type LibraryCollectionDetailScreenProps = {
  kind: LibraryCollectionDetailKind;
};

export function LibraryCollectionDetailScreen({
  kind,
}: LibraryCollectionDetailScreenProps) {
  const id = useNumericRouteParam();

  if (id === null) {
    return (
      <LibraryInvalidCollectionState
        state={getLibraryInvalidCollectionState()}
      />
    );
  }

  return <LibraryCollectionDetailContent id={id} kind={kind} />;
}

function LibraryCollectionDetailContent({
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
    <LibraryCollectionDetailView collection={collection} id={id} kind="album" />
  );
}

function ArtistCollectionDetailContent({ id }: { id: number }) {
  const collection = useArtistCollectionDetailQuery({ id });

  return (
    <LibraryCollectionDetailView collection={collection} id={id} kind="artist" />
  );
}

function PlaylistCollectionDetailContent({ id }: { id: number }) {
  const collection = usePlaylistCollectionDetailQuery({ id });

  return (
    <LibraryCollectionDetailView
      collection={collection}
      id={id}
      kind="playlist"
    />
  );
}
