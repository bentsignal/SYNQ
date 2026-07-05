import {
  useAlbumLinkedSongRowsQuery,
  useAllAddableSongRowsQuery,
  useArtistLinkedSongRowsQuery,
  usePlaylistLinkedSongRowsQuery,
} from "./use-addable-collection-song-rows-query";
import { useAddableCollectionSongsResult } from "./use-addable-collection-songs-result";

export type { AddableCollectionSong } from "../services/addable-collection-songs-types-service";

export function useAddableAlbumCollectionSongsQuery({
  collectionId,
  query,
}: {
  collectionId: number;
  query?: string;
}) {
  const songRows = useAllAddableSongRowsQuery();
  const linkedRows = useAlbumLinkedSongRowsQuery(collectionId);

  return useAddableCollectionSongsResult({
    linkedRows: linkedRows.rows,
    linkedRowsError: linkedRows.error,
    linkedRowsUpdatedAt: linkedRows.updatedAt,
    query,
    songRows,
  });
}

export function useAddableArtistCollectionSongsQuery({
  collectionId,
  query,
}: {
  collectionId: number;
  query?: string;
}) {
  const songRows = useAllAddableSongRowsQuery();
  const linkedRows = useArtistLinkedSongRowsQuery(collectionId);

  return useAddableCollectionSongsResult({
    linkedRows: linkedRows.rows,
    linkedRowsError: linkedRows.error,
    linkedRowsUpdatedAt: linkedRows.updatedAt,
    query,
    songRows,
  });
}

export function useAddablePlaylistCollectionSongsQuery({
  collectionId,
  query,
}: {
  collectionId: number;
  query?: string;
}) {
  const songRows = useAllAddableSongRowsQuery();
  const linkedRows = usePlaylistLinkedSongRowsQuery(collectionId);

  return useAddableCollectionSongsResult({
    linkedRows: linkedRows.rows,
    linkedRowsError: linkedRows.error,
    linkedRowsUpdatedAt: linkedRows.updatedAt,
    query,
    songRows,
  });
}

export type AddableCollectionSongsQueryResult = ReturnType<
  typeof useAddableAlbumCollectionSongsQuery
>;
