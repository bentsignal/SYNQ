import { useMemo } from "react";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { buildLibrarySongPreviewRowsQuery } from "../repository/library-song-preview-query-repository";
import {
  rowsToSongPreviews,
  type LibrarySongPreviewOrder,
  type LibrarySongPreviewRow,
  type LibrarySongPreviewSort,
} from "../services/library-song-preview-service";

export type {
  LibrarySongPreview,
  LibrarySongPreviewOrder,
  LibrarySongPreviewSort,
} from "../services/library-song-preview-service";

type LibrarySongPreviewQueryOptions = {
  limit?: number;
  order?: LibrarySongPreviewOrder;
  query?: string;
  sort?: LibrarySongPreviewSort;
};

export function useLibrarySongPreviewQuery({
  limit = 50,
  order = "desc",
  query,
  sort = "recent",
}: LibrarySongPreviewQueryOptions = {}) {
  const { data, error, updatedAt } = useLiveQuery(
    buildLibrarySongPreviewRowsQuery(),
  );

  const songs = useMemo(
    () =>
      rowsToSongPreviews({
        limit,
        order,
        query,
        rows: (data ?? []) as LibrarySongPreviewRow[],
        sort,
      }),
    [data, limit, order, query, sort],
  );

  return {
    error,
    isEmpty: songs.length === 0,
    songs,
    updatedAt,
  };
}
