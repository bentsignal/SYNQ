import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { parseNumericRouteParam } from "@/src/features/app-shell/services/route-param-service";
import { AddCollectionSongsFormView } from "../components/AddCollectionSongsFormView";
import { LibraryInvalidCollectionState } from "../components/LibraryInvalidCollectionState";
import { useAddCollectionSongsController } from "../hooks/use-add-collection-songs-controller";
import {
  useAddableAlbumCollectionSongsQuery,
  useAddableArtistCollectionSongsQuery,
  useAddablePlaylistCollectionSongsQuery,
} from "../hooks/use-addable-collection-songs-query";
import type { LibraryCollectionDetailKind } from "../hooks/use-library-collection-detail-query";

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
  const [query, setQuery] = useState("");
  const addable = useAddableAlbumCollectionSongsQuery({
    collectionId: id,
    query,
  });

  return (
    <AddCollectionSongsForm
      addable={addable}
      id={id}
      kind="album"
      query={query}
      setQuery={setQuery}
    />
  );
}

function AddArtistCollectionSongsContent({ id }: { id: number }) {
  const [query, setQuery] = useState("");
  const addable = useAddableArtistCollectionSongsQuery({
    collectionId: id,
    query,
  });

  return (
    <AddCollectionSongsForm
      addable={addable}
      id={id}
      kind="artist"
      query={query}
      setQuery={setQuery}
    />
  );
}

function AddPlaylistCollectionSongsContent({ id }: { id: number }) {
  const [query, setQuery] = useState("");
  const addable = useAddablePlaylistCollectionSongsQuery({
    collectionId: id,
    query,
  });

  return (
    <AddCollectionSongsForm
      addable={addable}
      id={id}
      kind="playlist"
      query={query}
      setQuery={setQuery}
    />
  );
}

type AddCollectionSongsFormProps = {
  addable: ReturnType<typeof useAddableAlbumCollectionSongsQuery>;
  id: number;
  kind: LibraryCollectionDetailKind;
  query: string;
  setQuery: (query: string) => void;
};

function AddCollectionSongsForm({
  addable,
  id,
  kind,
  query,
  setQuery,
}: AddCollectionSongsFormProps) {
  const { errors, songs, updatedAt } = addable;
  const hasErrors = errors.length > 0;
  const updatedLabel =
    updatedAt > 0
      ? `Updated ${new Date(updatedAt).toLocaleTimeString()}`
      : "Waiting for library data";
  const {
    addSelectedSongs,
    addSong,
    mutationError,
    savingSongId,
    selectedSongIds,
    selectionState,
    toggleSongSelection,
  } = useAddCollectionSongsController({
    collectionId: id,
    kind,
    songs,
  });

  return (
    <AddCollectionSongsFormView
      collectionId={id}
      hasErrors={hasErrors}
      kind={kind}
      mutationError={mutationError}
      onAddSelectedSongs={addSelectedSongs}
      onAddSong={addSong}
      onChangeQuery={setQuery}
      onToggleSongSelection={toggleSongSelection}
      query={query}
      savingSongId={savingSongId}
      selectedSongIds={selectedSongIds}
      selectionState={selectionState}
      songs={songs}
      updatedLabel={updatedLabel}
    />
  );
}
