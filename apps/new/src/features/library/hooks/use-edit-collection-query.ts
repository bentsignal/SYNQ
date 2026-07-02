import { getImagePathFromHash } from "@/src/features/images/services/image-storage-service";
import {
  useEditAlbumRowQuery,
  useEditArtistRowQuery,
  useEditPlaylistRowQuery,
} from "./use-edit-collection-row-query";
import {
  buildEditCollectionState,
} from "../services/edit-collection-query-service";

export type { EditCollectionKind } from "../services/edit-collection-query-service";

const getSmallImagePath = (imageHash: string) =>
  getImagePathFromHash(imageHash).pathToSmallImage;

const mapAlbumEditQuery = (album: ReturnType<typeof useEditAlbumRowQuery>) => ({
  error: album.error,
  ...buildEditCollectionState({
    albumRow: album.row,
    getImagePath: getSmallImagePath,
    hasLoaded: Boolean(album.updatedAt),
    kind: "album" as const,
  }),
  updatedAt: album.updatedAt,
});

const mapArtistEditQuery = (
  artist: ReturnType<typeof useEditArtistRowQuery>,
) => ({
  error: artist.error,
  ...buildEditCollectionState({
    artistRow: artist.row,
    getImagePath: getSmallImagePath,
    hasLoaded: Boolean(artist.updatedAt),
    kind: "artist" as const,
  }),
  updatedAt: artist.updatedAt,
});

const mapPlaylistEditQuery = (
  playlist: ReturnType<typeof useEditPlaylistRowQuery>,
) => ({
  error: playlist.error,
  ...buildEditCollectionState({
    getImagePath: getSmallImagePath,
    hasLoaded: Boolean(playlist.updatedAt),
    kind: "playlist" as const,
    playlistRow: playlist.row,
  }),
  updatedAt: playlist.updatedAt,
});

export function useEditAlbumCollectionQuery({ id }: { id: number }) {
  const album = useEditAlbumRowQuery(id);

  return mapAlbumEditQuery(album);
}

export function useEditArtistCollectionQuery({ id }: { id: number }) {
  const artist = useEditArtistRowQuery(id);

  return mapArtistEditQuery(artist);
}

export function useEditPlaylistCollectionQuery({ id }: { id: number }) {
  const playlist = useEditPlaylistRowQuery(id);

  return mapPlaylistEditQuery(playlist);
}

export type EditCollectionQueryResult = ReturnType<
  typeof useEditAlbumCollectionQuery
>;
