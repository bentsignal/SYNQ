import { useAddCollectionSongsFormController } from "./use-add-collection-songs-form-controller";
import { useAddCollectionSongsSearchQuery } from "./use-add-collection-songs-search-query";
import {
  useAddableAlbumCollectionSongsQuery,
  useAddableArtistCollectionSongsQuery,
  useAddablePlaylistCollectionSongsQuery,
} from "./use-addable-collection-songs-query";

type UseAddCollectionSongsConnectedControllerParams = {
  collectionId: number;
};

export function useAddAlbumCollectionSongsConnectedController({
  collectionId,
}: UseAddCollectionSongsConnectedControllerParams) {
  const { query, setQuery } = useAddCollectionSongsSearchQuery();
  const addable = useAddableAlbumCollectionSongsQuery({
    collectionId,
    query,
  });

  return useAddCollectionSongsFormController({
    addable,
    collectionId,
    kind: "album",
    onChangeQuery: setQuery,
    query,
  });
}

export function useAddArtistCollectionSongsConnectedController({
  collectionId,
}: UseAddCollectionSongsConnectedControllerParams) {
  const { query, setQuery } = useAddCollectionSongsSearchQuery();
  const addable = useAddableArtistCollectionSongsQuery({
    collectionId,
    query,
  });

  return useAddCollectionSongsFormController({
    addable,
    collectionId,
    kind: "artist",
    onChangeQuery: setQuery,
    query,
  });
}

export function useAddPlaylistCollectionSongsConnectedController({
  collectionId,
}: UseAddCollectionSongsConnectedControllerParams) {
  const { query, setQuery } = useAddCollectionSongsSearchQuery();
  const addable = useAddablePlaylistCollectionSongsQuery({
    collectionId,
    query,
  });

  return useAddCollectionSongsFormController({
    addable,
    collectionId,
    kind: "playlist",
    onChangeQuery: setQuery,
    query,
  });
}
