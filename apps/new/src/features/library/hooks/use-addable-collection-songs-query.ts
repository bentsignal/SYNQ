import { useMemo } from "react";
import {
  useAlbumLinkedSongRowsQuery,
  useAllAddableSongRowsQuery,
  useArtistLinkedSongRowsQuery,
  usePlaylistLinkedSongRowsQuery,
} from "./use-addable-collection-song-rows-query";
import {
  rowsToLinkedSongIds,
  rowsToAddableCollectionSongs,
} from "../services/addable-collection-songs-service";

export type { AddableCollectionSong } from "../services/addable-collection-songs-service";

function useAddableCollectionSongsResult({
  linkedRows,
  linkedRowsError,
  linkedRowsUpdatedAt,
  query,
  songRows,
}: {
  linkedRows: Parameters<typeof rowsToLinkedSongIds>[0];
  linkedRowsError: Error | undefined;
  linkedRowsUpdatedAt: Date | undefined;
  query?: string;
  songRows: ReturnType<typeof useAllAddableSongRowsQuery>;
}) {
  const addableSongs = useMemo(() => {
    return rowsToAddableCollectionSongs({
      linkedSongIds: rowsToLinkedSongIds(linkedRows),
      query,
      rows: songRows.rows,
    });
  }, [linkedRows, query, songRows.rows]);

  return {
    errors: [songRows.error, linkedRowsError].filter(Boolean),
    songs: addableSongs,
    updatedAt: Math.max(
      songRows.updatedAt?.getTime() ?? 0,
      linkedRowsUpdatedAt?.getTime() ?? 0,
    ),
  };
}

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
