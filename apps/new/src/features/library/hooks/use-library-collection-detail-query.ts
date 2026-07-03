import {
  useAlbumCollectionDetailRowsQuery,
  useArtistCollectionDetailRowsQuery,
  usePlaylistCollectionDetailRowsQuery,
} from "./use-library-collection-detail-rows-query";
import {
  useAlbumCollectionDetailResult,
  useArtistCollectionDetailResult,
  usePlaylistCollectionDetailResult,
} from "./use-library-collection-detail-result";

export type {
  LibraryCollectionDetailSong,
} from "../services/library-collection-detail-service";
export type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";

export function usePlaylistCollectionDetailQuery({ id }: { id: number }) {
  const playlist = usePlaylistCollectionDetailRowsQuery(id);
  return usePlaylistCollectionDetailResult(playlist);
}

export function useAlbumCollectionDetailQuery({ id }: { id: number }) {
  const album = useAlbumCollectionDetailRowsQuery(id);
  return useAlbumCollectionDetailResult(album);
}

export function useArtistCollectionDetailQuery({ id }: { id: number }) {
  const artist = useArtistCollectionDetailRowsQuery(id);
  return useArtistCollectionDetailResult(artist);
}
