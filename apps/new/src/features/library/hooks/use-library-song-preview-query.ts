import { useMemo } from "react";
import { useLibrarySongPreviewLiveQuery } from "../data/use-library-song-preview-live-query";
import {
  type LibrarySongPreviewOrder,
  type LibrarySongPreviewRow,
  type LibrarySongPreviewSort,
} from "../services/library-song-preview-service";
import { buildLibrarySongPreviewQueryResult } from "../services/library-song-preview-query-result-service";

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
  const { data, error, updatedAt } = useLibrarySongPreviewLiveQuery();

  return useMemo(
    () =>
      buildLibrarySongPreviewQueryResult({
        error,
        limit,
        order,
        query,
        rows: (data ?? []) as LibrarySongPreviewRow[],
        sort,
        updatedAt,
      }),
    [data, error, limit, order, query, sort, updatedAt],
  );
}
