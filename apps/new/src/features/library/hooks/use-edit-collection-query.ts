import { getImagePathFromHash } from "@/src/features/images/services/image-storage-service";
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

export type { EditCollectionKind } from "../services/edit-collection-query-service";

const getSmallImagePath = (imageHash: string) =>
  getImagePathFromHash(imageHash).pathToSmallImage;

export function useEditAlbumCollectionQuery({ id }: { id: number }) {
  const album = useEditAlbumRowQuery(id);

  return buildEditAlbumCollectionQueryResult({
    album,
    getImagePath: getSmallImagePath,
  });
}

export function useEditArtistCollectionQuery({ id }: { id: number }) {
  const artist = useEditArtistRowQuery(id);

  return buildEditArtistCollectionQueryResult({
    artist,
    getImagePath: getSmallImagePath,
  });
}

export function useEditPlaylistCollectionQuery({ id }: { id: number }) {
  const playlist = useEditPlaylistRowQuery(id);

  return buildEditPlaylistCollectionQueryResult({
    getImagePath: getSmallImagePath,
    playlist,
  });
}

export type EditCollectionQueryResult = ReturnType<
  typeof useEditAlbumCollectionQuery
>;
