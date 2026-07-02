import { useMemo } from "react";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import {
  buildAlbumLinkedSongRowsQuery,
  buildAllAddableSongRowsQuery,
  buildArtistLinkedSongRowsQuery,
  buildPlaylistLinkedSongRowsQuery,
} from "../repository/addable-collection-songs-query-repository";
import {
  rowsToLinkedSongIds,
  rowsToAddableCollectionSongs,
  type AddableCollectionLinkedSongRow,
  type AddableCollectionSongRow,
} from "../services/addable-collection-songs-service";

export type { AddableCollectionSong } from "../services/addable-collection-songs-service";

function useAllAddableSongRowsQuery() {
  return useLiveQuery(buildAllAddableSongRowsQuery());
}

function usePlaylistLinkedSongRowsQuery(collectionId: number) {
  return useLiveQuery(buildPlaylistLinkedSongRowsQuery(collectionId));
}

function useAlbumLinkedSongRowsQuery(collectionId: number) {
  return useLiveQuery(buildAlbumLinkedSongRowsQuery(collectionId));
}

function useArtistLinkedSongRowsQuery(collectionId: number) {
  return useLiveQuery(buildArtistLinkedSongRowsQuery(collectionId));
}

function useAddableCollectionSongsResult({
  linkedRows,
  linkedRowsError,
  linkedRowsUpdatedAt,
  query,
  songRows,
}: {
  linkedRows: AddableCollectionLinkedSongRow[] | undefined;
  linkedRowsError: Error | undefined;
  linkedRowsUpdatedAt: Date | undefined;
  query?: string;
  songRows: ReturnType<typeof useAllAddableSongRowsQuery>;
}) {
  const addableSongs = useMemo(() => {
    return rowsToAddableCollectionSongs({
      linkedSongIds: rowsToLinkedSongIds(linkedRows),
      query,
      rows: (songRows.data ?? []) as AddableCollectionSongRow[],
    });
  }, [linkedRows, query, songRows.data]);

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
    linkedRows: linkedRows.data,
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
    linkedRows: linkedRows.data,
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
    linkedRows: linkedRows.data,
    linkedRowsError: linkedRows.error,
    linkedRowsUpdatedAt: linkedRows.updatedAt,
    query,
    songRows,
  });
}

export type AddableCollectionSongsQueryResult = ReturnType<
  typeof useAddableAlbumCollectionSongsQuery
>;
