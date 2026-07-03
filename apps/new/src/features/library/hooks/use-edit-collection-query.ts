import {
  useEditAlbumRowQuery,
  useEditArtistRowQuery,
  useEditPlaylistRowQuery,
} from "./use-edit-collection-row-query";
import {
  buildEditAlbumCollectionQueryResult,
  buildEditArtistCollectionQueryResult,
  buildEditPlaylistCollectionQueryResult,
} from "../services/edit-collection-query-service";
import { getLibrarySmallImagePath } from "../services/library-image-path-service";

export type { EditCollectionKind } from "../services/edit-collection-query-service";

export function useEditAlbumCollectionQuery({ id }: { id: number }) {
  const album = useEditAlbumRowQuery(id);

  return buildEditAlbumCollectionQueryResult({
    album,
    getImagePath: getLibrarySmallImagePath,
  });
}

export function useEditArtistCollectionQuery({ id }: { id: number }) {
  const artist = useEditArtistRowQuery(id);

  return buildEditArtistCollectionQueryResult({
    artist,
    getImagePath: getLibrarySmallImagePath,
  });
}

export function useEditPlaylistCollectionQuery({ id }: { id: number }) {
  const playlist = useEditPlaylistRowQuery(id);

  return buildEditPlaylistCollectionQueryResult({
    getImagePath: getLibrarySmallImagePath,
    playlist,
  });
}

export type EditCollectionQueryResult = ReturnType<
  typeof useEditAlbumCollectionQuery
>;
