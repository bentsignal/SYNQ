import { useMemo } from "react";
import {
  rowsToAddableCollectionSongs,
  rowsToLinkedSongIds,
} from "../services/addable-collection-songs-service";
import type { useAllAddableSongRowsQuery } from "./use-addable-collection-song-rows-query";

export function useAddableCollectionSongsResult({
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
