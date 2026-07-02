import { useLocalSearchParams } from "expo-router";
import { parseNumericRouteParam } from "@/src/features/app-shell/services/route-param-service";
import { EditCollectionConnectedForm } from "../components/EditCollectionConnectedForm";
import { LibraryInvalidCollectionState } from "../components/LibraryInvalidCollectionState";
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

  return (
    <EditCollectionConnectedForm
      collection={collection}
      copy={labels.album}
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
      copy={labels.artist}
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
      copy={labels.playlist}
      id={id}
      kind="playlist"
    />
  );
}
