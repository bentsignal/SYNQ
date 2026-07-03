import { useMemo } from "react";
import {
  type AddableCollectionLinkedSongRow,
} from "../services/addable-collection-songs-service";
import { buildAddableCollectionSongsResult } from "../services/addable-collection-songs-result-service";
import type { useAllAddableSongRowsQuery } from "./use-addable-collection-song-rows-query";

export function useAddableCollectionSongsResult({
  linkedRows,
  linkedRowsError,
  linkedRowsUpdatedAt,
  query,
  songRows,
}: {
  linkedRows: readonly AddableCollectionLinkedSongRow[];
  linkedRowsError: Error | undefined;
  linkedRowsUpdatedAt: Date | undefined;
  query?: string;
  songRows: ReturnType<typeof useAllAddableSongRowsQuery>;
}) {
  return useMemo(
    () =>
      buildAddableCollectionSongsResult({
        linkedRows,
        linkedRowsError,
        linkedRowsUpdatedAt,
        query,
        songRows: songRows.rows,
        songRowsError: songRows.error,
        songRowsUpdatedAt: songRows.updatedAt,
      }),
    [
      linkedRows,
      linkedRowsError,
      linkedRowsUpdatedAt,
      query,
      songRows.error,
      songRows.rows,
      songRows.updatedAt,
    ],
  );
}
